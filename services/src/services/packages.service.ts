import {
  BadRequestError,
  NotFoundError,
  Pagination,
} from '@share-package/common';
import { Package, PackageLookupDoc } from '../models/package';
import { Check } from '../utils/check-type';
import { AwsServices } from './aws.service';
import { PackagePublisher } from './package.publisher.service';
import { PackageService } from '../models/package-service';
import { Service } from '../models/service';
import { select } from '../utils/convert';
import mongoose, { ObjectId } from 'mongoose';
import exceljs from 'exceljs';
const PER_PAGE = process.env.PER_PAGE!;
interface ServiceInterface {
  code: string;
  name: string;
}
export class PackageServices {
  static async newPackage(
    name: string,
    costPrice: number,
    file: Express.Multer.File,
    description: string,
    count: number,
    expire: number,
    code: string
  ) {
    // check package exitst
    const existPackage = await Package.findOne({
      $or: [{ name: name }, { code: code }],
      isDeleted: false,
    });
    // if exist => throw error
    if (existPackage)
      throw new BadRequestError('Package name or package code is exist');
    // define imageUrls
    // check file type
    Check.checkImage(file);
    // upload file
    const imageUrl = await AwsServices.uploadFile(file);
    // push imageUrl on imageUrls
    // define package
    const newPackage = Package.build({
      name: name,
      description: description,
      costPrice: costPrice,
      imageUrl: imageUrl,
      count: count,
      expire: expire,
      code: code,
    });
    // save package on database
    await newPackage.save();
    // publish created event
    PackagePublisher.newPackage(newPackage);
    // return package for controller
    return newPackage;
  }
  static async readAll(
    pages: string,
    sortBy: string,
    lteDiscount: number,
    gteDiscount: number,
    ltePrice: number,
    gtePrice: number,
    isManager: boolean,
    price: string,
    discount: string,
    featured: boolean,
    lteCount: number,
    gteCount: number,
    count: string,
    lteExpire: number,
    gteExpire: number,
    expire: string
  ) {
    // define query
    const query = Pagination.query();
    query.isDeleted = false;
    // if gteDiscount => find package had discount >= gteDiscount
    if (gteDiscount) query.discount = { $gte: gteDiscount };
    if (lteDiscount) query.discount = { $lte: lteDiscount };
    if (gteDiscount && lteDiscount)
      query.discount = { $gte: gteDiscount, $lte: lteDiscount };
    if (gtePrice) query.salePrice = { $gte: gtePrice };
    if (ltePrice) query.salePrice = { $lte: ltePrice };
    if (gtePrice && ltePrice)
      query.salePrice = { $gte: gtePrice, $lte: ltePrice };

    if (gteCount) query.count = { $gte: gteCount };
    if (lteCount) query.count = { $lte: lteCount };
    if (gteCount && lteCount) query.count = { $gte: gteCount, $lte: lteCount };

    if (gteExpire) query.expire = { $gte: gteExpire };
    if (lteExpire) query.expire = { $lte: lteExpire };
    if (lteExpire && gteExpire)
      query.expire = { $gte: gteExpire, $lte: lteExpire };
    // console.log(query);
    // console.log('isManager', isManager);

    const sort = Pagination.query();
    if (sortBy === 'asc') sort.name = 1;
    if (sortBy === 'desc') sort.name = -1;
    if (price === 'asc') sort.salePrice = 1;
    if (price === 'desc') sort.salePrice = -1;
    if (discount === 'asc') sort.discount = 1;
    if (discount === 'asc') sort.discount = -1;
    if (featured === true) sort.discount = -1;
    if (featured === false) sort.discount = -1;
    if (expire === 'asc') sort.expire = 1;
    if (expire === 'desc') sort.expire = -1;
    if (count === 'asc') sort.count = 1;
    if (count === 'desc') sort.count = -1;
    // get total package by query
    const options = Pagination.options(pages, PER_PAGE, sort);
    const totalItems = await Package.find(query).countDocuments();
    // get packages
    const packages = await Package.find(
      query,
      isManager ? null : { costPrice: 0 },
      options
    );
    return { packages, totalItems };
  }
  static async readOne(id: string, isManager: boolean) {
    // find package exist
    const existPackage = await Package.findOne(
      { _id: id, isDeleted: false },
      isManager ? null : select
    );
    // if exist => throw error
    if (!existPackage) throw new NotFoundError('Package');
    // check package service exist
    const packageServices = await PackageService.find(
      { package: existPackage.id },
      isManager ? null : select
    );
    // if packageService lenght => no service attach package => return package
    if (packageServices.length === 0) return { existPackage };
    // define service id array
    const serviceIds: mongoose.Types.ObjectId[] = [];
    packageServices.forEach((ps) =>
      // push service id
      serviceIds.push(new mongoose.Types.ObjectId(ps.service.id))
    );
    // find services attach with package
    const services = await Service.find({ _id: { $in: serviceIds } });
    // if user = manager => return services not attach with package
    const notInSerivce = await Service.find(
      { _id: { $nin: serviceIds }, isDeleted: false },
      isManager ? null : select
    );
    return { existPackage, notInSerivce, services };
  }
  static async deletedPackage(id: string) {
    // check exist package and isDeleted = false
    const existPackage = await Package.findPackage(id);
    // if !package => throw error
    if (!existPackage) throw new NotFoundError('Package');
    // update isDeleted = true
    existPackage.set({ isDeleted: true });
    // save database
    await existPackage.save();
    // publisher deleted event
    PackagePublisher.deletePackage(existPackage);
    // return controller
    return existPackage;
  }
  static async updatePackage(packageAttrs: {
    id: string;
    name: string;
    costPrice: number;
    // salePrice: number;
    discount: number;
    count: number;
    expire: number;
    file: Express.Multer.File;
    featured: boolean;
    description: string;
    code: string;
  }) {
    const existPackage = await Package.findOne({
      _id: packageAttrs.id,
      isDeleted: false,
    });
    if (!existPackage) throw new NotFoundError('Package services');
    let imageUrl = existPackage.imageUrl;
    if (packageAttrs.file) {
      await AwsServices.deleteFile(imageUrl);
      Check.checkImage(packageAttrs.file);
      imageUrl = await AwsServices.uploadFile(packageAttrs.file);
    }
    existPackage.set({
      name: packageAttrs.name,
      costPrice: packageAttrs.costPrice,
      // salePrice: packageAttrs.salePrice,
      imageUrl: imageUrl,
      discount: packageAttrs.discount,
      expire: packageAttrs.expire,
      count: packageAttrs.count,
      featured: packageAttrs.featured,
      description: packageAttrs.description,
      code: packageAttrs.code,
    });
    await existPackage.save();
    return existPackage;
  }
  static async exportPackage() {
    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet('Gói dịch vụ');
    const packages = await Package.aggregate<PackageLookupDoc>([
      {
        $lookup: {
          from: 'packageservices',
          localField: '_id',
          foreignField: 'package',
          as: 'packageservices',
        },
      },
      {
        $lookup: {
          from: 'services',
          localField: 'packageservices.service',
          foreignField: '_id',
          as: 'services',
        },
      },
    ]);
    if (packages.length <= 0) {
      throw new BadRequestError('Packages not found');
    }

    sheet.columns = [
      { header: 'Mã gói dịch vụ', key: 'code', width: 25 },
      { header: 'Tên gói dịch vụ', key: 'name', width: 35 },
      {
        header: 'Hình ảnh',
        key: 'imageUrl',
        width: 50,
      },
      {
        header: 'Giá gốc (đ)',
        key: 'costPrice',
        width: 15,
      },
      {
        header: 'Giá bán (đ)',
        key: 'salePrice',
        width: 15,
      },
      { header: 'Mã dịch vụ', key: 'serviceCode', width: 25 },
      { header: 'Tên dịch vụ', key: 'serviceName', width: 35 },
      {
        header: 'Giảm giá (%)',
        key: 'discount',
        width: 15,
      },
      {
        header: 'Lộ trình',
        key: 'count',
        width: 25,
      },
      {
        header: 'Hạn sử dụng (ngày)',
        key: 'expire',
        width: 25,
      },
      {
        header: 'Bán chạy',
        key: 'featured',
        width: 10,
      },
      {
        header: 'Mô tả',
        key: 'description',
        width: 50,
      },
    ];
    packages.map((value, index) => {
      sheet.addRow({
        code: value.code,
        name: value.name,
        imageUrl: value.imageUrl,
        costPrice: value.costPrice,
        salePrice: value.salePrice,
        discount: value.discount,
        count: value.count,
        expire: value.expire,
        featured: value.featured === true ? 'Có' : 'Không',
        description: value.description,
        // isDeleted: value.isDeleted,
        // serviceCode: ,
        // serviceName: service.name,
      });
      let rowIndex = 1;
      for (rowIndex; rowIndex <= sheet.rowCount; rowIndex++) {
        sheet.getRow(rowIndex).alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true,
        };
      }
    });
    return workbook;
  }
}
