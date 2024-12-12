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
import { Service, ServiceDoc } from '../models/service';
import { select } from '../utils/convert';
import mongoose, { ObjectId } from 'mongoose';
import exceljs from 'exceljs';
import {
  PackageServiceServices,
  ServiceAttrs,
} from './package-serivce.service';
import _, { update } from 'lodash';
import { PackageServicePublisher } from './package-service.publisher.service';
const PER_PAGE = process.env.PER_PAGE!;
export interface ServiceInPacakge {
  serviceId: string;
  name: string;
  imageUrl: string;
  quantity: number;
}
export interface ServiceAttr {
  id: string;
  quantity: number;
}
export class PackageServices {
  static async newPackage(
    name: string,
    costPrice: number,
    file: Express.Multer.File,
    description: string,
    count: number,
    expire: number,
    code: string,
    services: ServiceAttr[]
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
      costPrice: _.round(costPrice),
      imageUrl: imageUrl,
      count: count,
      expire: expire,
      code: code,
    });
    await newPackage.save();
    PackagePublisher.newPackage(newPackage);
    // save package on database
    const { packageExist, servicesInPackage } =
      await PackageServiceServices.newPackageServices(services, newPackage.id);
    // publish created event
    // return package for controller
    return { newPackage, servicesInPackage };
  }
  static async readAll(
    pages: string,
    name: string,
    isManager: boolean,
    priceRange: string,
    price: string,
    discountRange: string,
    discount: string,
    featured: string,
    countRange: string,
    count: string,
    expireRange: string,
    expire: string
  ) {
    // define query
    const query = Pagination.query();
    query.isDeleted = false;
    // if gteDiscount => find package had discount >= gteDiscount
    const highDiscount = 50;
    const lowDiscount = 15;
    if (discountRange === 'highdiscount')
      query.discount = { $gt: highDiscount };
    if (discountRange === 'lowdiscount') query.discount = { $lt: lowDiscount };
    if (discountRange === 'mediumdiscount')
      query.discount = { $gte: lowDiscount, $lte: highDiscount };
    const highPrice = 3000000;
    const lowPrice = 500000;
    if (priceRange === 'highprice') query.salePrice = { $gt: highPrice };
    if (priceRange === 'lowprice') query.salePrice = { $lt: lowPrice };
    if (priceRange === 'mediumprice')
      query.salePrice = { $gte: lowPrice, $lte: highPrice };
    const highCount = 7;
    const lowCount = 3;
    if (countRange === 'highcount') query.count = { $gt: highCount };
    if (countRange === 'lowcount') query.count = { $lt: lowCount };
    if (countRange === 'mediumcount')
      query.count = { $gte: lowCount, $lte: highCount };
    const highExpire = 30;
    const lowExpire = 15;
    if (expireRange === 'highexpire') query.expire = { $gt: highExpire };
    if (expireRange === 'lowexpire') query.expire = { $lt: lowExpire };
    if (expireRange === 'mediumexpire')
      query.expire = { $gte: lowExpire, $lte: highExpire };
    if (featured === 'true') query.featured = true;
    if (featured === 'false') query.featured = false;
    // console.log(query);
    // console.log('isManager', isManager);

    const sort = Pagination.query();
    if (name === 'asc') sort.name = 1;
    if (name === 'desc') sort.name = -1;
    if (price === 'asc') sort.salePrice = 1;
    if (price === 'desc') sort.salePrice = -1;
    if (discount === 'asc') sort.discount = 1;
    if (discount === 'asc') sort.discount = -1;
    if (expire === 'asc') sort.expire = 1;
    if (expire === 'desc') sort.expire = -1;
    if (count === 'asc') sort.count = 1;
    if (count === 'desc') sort.count = -1;
    // get total package by query
    // const options = Pagination.options(pages, PER_PAGE, sort);
    // console.log(options);
    // console.log(query);

    const totalItems = await Package.find(query).countDocuments();
    // get packages
    const packages = await Package.find(
      query,
      isManager ? null : { costPrice: 0 },
      sort
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
      { package: existPackage.id, isDeleted: false },
      isManager ? null : select
    ).populate({ path: 'service' });
    // if packageService lenght => no service attach package => return package
    if (packageServices.length === 0) return { existPackage };
    // define service id array
    // const serviceIds: mongoose.Types.ObjectId[] = [];
    const serviceInPackage: ServiceInPacakge[] = [];
    for (const ps of packageServices) {
      // if (ps.service.isDeleted === true) continue;
      serviceInPackage.push({
        serviceId: ps.service.id,
        name: ps.service.name,
        imageUrl: ps.service.imageUrl,
        quantity: ps.quantity,
      });
    }
    // push service id

    // find services attach with package

    // if user = manager => return services not attach with package
    // const notInSerivce = await Service.find(
    //   { _id: { $nin: serviceIds }, isDeleted: false },
    //   isManager ? null : select
    // ).sort({ name: 1 });
    return { existPackage, services: serviceInPackage };
  }
  static async deletedPackage(id: string) {
    // check exist package and isDeleted = false
    const existPackage = await Package.findPackage(id);
    // if !package => throw error
    if (!existPackage) throw new NotFoundError('Package');
    // update isDeleted = true
    existPackage.set({ isDeleted: true });
    await PackageService.updateMany(
      { package: existPackage.id },
      { isDeleted: true }
    );
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
    services: ServiceAttr[];
  }) {
    const existPackage = await Package.findOne({
      _id: packageAttrs.id,
      isDeleted: false,
    });
    if (!existPackage) throw new NotFoundError('Package-Services');
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
      discount: packageAttrs.discount ?? existPackage.discount,
      expire: packageAttrs.expire,
      count: packageAttrs.count,
      featured: packageAttrs.featured ?? existPackage.featured,
      description: packageAttrs.description,
      code: packageAttrs.code,
    });
    const { serviceAttr, services } =
      await PackageServiceServices.findServiceInPackageId(existPackage.id);

    const servicesInPackage: ServiceInPacakge[] = [];

    // const existIds = serviceInPackage.map((srv) => srv.serviceId);
    const updateServiceAttr: ServiceAttr[] = [];
    packageAttrs.services.map((srv) =>
      updateServiceAttr.push({
        id: srv.id,
        quantity: srv.quantity,
      })
    );
    const addValue = _.differenceBy(updateServiceAttr, serviceAttr, 'id');
    const updateValue = _.intersectionBy(updateServiceAttr, serviceAttr, 'id');
    const deleteValue = _.differenceBy(serviceAttr, updateServiceAttr, 'id');
    console.log('addIds', addValue);
    console.log('deleteValue', deleteValue);
    console.log('updateValue', updateValue);

    const updateServices = await PackageServiceServices.updatePackageSevices(
      updateValue,
      existPackage
    );
    updateServices.map((update) =>
      servicesInPackage.push({
        serviceId: update.service.id,
        name: update.service.name,
        imageUrl: update.service.name,
        quantity: update.quantity,
      })
    );
    const addServices = await PackageServiceServices.newPackageServices(
      addValue,
      existPackage.id
    );
    addServices.servicesInPackage.map((add) =>
      servicesInPackage.push({
        serviceId: add.service.id,
        name: add.service.name,
        imageUrl: add.service.name,
        quantity: add.quantity,
      })
    );
    const deleteServices = await PackageServiceServices.deletePackageServices(
      deleteValue,
      existPackage
    );

    return {
      existPackage,
      servicesInPackage,
    };
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
  static async getByName(
    name: string,
    pages: string,
    sort: string,
    isManager: boolean
  ) {
    const filter = Pagination.query();
    filter.isDeleted = false;
    filter.name = new RegExp(name, 'i');
    const sortBy = Pagination.query();
    sortBy.name = 1;
    if (sort === 'asc') sortBy.name = 1;
    if (sort === 'desc') sortBy.name = -1;
    const options = Pagination.options(pages, PER_PAGE, sortBy);
    const packages = await Package.find(
      filter,
      isManager ? null : { costPrice: 0 },
      options
    );
    const totalItems = await Package.find(filter).countDocuments();
    return { packages, totalItems };
  }
}
