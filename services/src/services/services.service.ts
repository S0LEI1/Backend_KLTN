import {
  BadRequestError,
  NotFoundError,
  UserType,
} from '@share-package/common';
import { Service } from '../models/service';
import { checkImage } from '../utils/check-image';
import { AwsServices } from './aws.service';
import { Pagination } from '../utils/pagination';
import { Check } from '../utils/check-type';
import { calcSalePrice } from '../utils/calcSalePrice';
import { ServicePublishers } from './services.publisher.service';
import exceljs from 'exceljs';
const PER_PAGES = process.env.PER_PAGES;
export class ServiceServices {
  static async new(
    name: string,
    file: Express.Multer.File,
    description: string,
    costPrice: number,
    time: number,
    expire: number
  ) {
    const imageUrl = await AwsServices.uploadFile(file);
    const existService = await Service.findOne({ name: name });
    if (existService) throw new BadRequestError('service already exists');
    const service = Service.build({
      name: name,
      imageUrl: imageUrl,
      description: description,
      costPrice: costPrice,
      time: time,
      expire: expire,
    });
    await service.save();
    ServicePublishers.new(service);
    return service;
  }
  static async readAll(
    pages: string,
    sortBy: string,
    isManager: boolean,
    lteDiscount: number,
    gteDiscount: number,
    ltePrice: number,
    gtePrice: number
  ) {
    const query = Pagination.query();
    query.isDeleted = false;
    if (gteDiscount) query.discount = { $gte: gteDiscount };
    if (lteDiscount) query.discount = { $lte: lteDiscount };
    if (gteDiscount && lteDiscount)
      query.discount = { $gte: gteDiscount, $lte: lteDiscount };
    if (gtePrice) query.salePrice = { $gte: gtePrice };
    if (ltePrice) query.salePrice = { $lte: ltePrice };
    if (gtePrice && ltePrice)
      query.salePrice = { $gte: gtePrice, $lte: ltePrice };
    const select = {
      _id: 1,
      name: 1,
      imageUrl: 1,
      salePrice: 1,
      description: 1,
    };

    const options = Pagination.options(pages, PER_PAGES!, sortBy);
    const services = await Service.find(
      query,
      isManager ? null : select,
      options
    );
    const totalItems = await Service.find(query).countDocuments();
    return { services, totalItems };
  }
  static async readOne(id: string, isManager: boolean) {
    const query = Pagination.query();
    query.isDeleted = false;
    query._id = id;
    const select = {
      _id: 1,
      name: 1,
      imageUrl: 1,
      salePrice: 1,
      description: 1,
      createdAt: 1,
    };
    const service = await Service.find(query, isManager ? null : select, null);
    if (!service) throw new NotFoundError('Service');
    return service;
  }
  static async update(
    id: string,
    file: Express.Multer.File,
    name: string,
    costPrice: number,
    description: string,
    discount: number,
    featured: boolean,
    time: number,
    expire: number
  ) {
    const query = Pagination.query();
    query._id = id;
    query.isDeleted = false;
    const service = await Service.findOne(query);
    if (!service) throw new NotFoundError('Service not found');
    let { imageUrl } = service;
    if (file) {
      await AwsServices.deleteFile(imageUrl);
      Check.checkImage(file);
      imageUrl = await AwsServices.uploadFile(file);
    }
    const salePrice = calcSalePrice(costPrice, discount);
    service.set({
      name: name,
      costPrice: costPrice,
      description: description,
      discount: discount,
      salePrice: salePrice,
      imageUrl: imageUrl,
      featured: featured,
      time: time,
      expire: expire,
    });
    await service.save();
    return service;
  }
  static async deleteService(id: string) {
    const query = Pagination.query();
    query._id = id;
    query.isDeleted = false;
    const service = await Service.findOne(query);
    if (!service) throw new NotFoundError('Service');
    service.set({ isDeleted: true });
    await service.save();
    return service;
  }
  static async readByName(
    name: string,
    isManager: boolean,
    pages: string,
    sortBy: string
  ) {
    const query = Pagination.query();
    query.name = new RegExp(name, 'i');
    query.isDeleted = false;
    const select = {
      _id: 1,
      name: 1,
      imageUrl: 1,
      salePrice: 1,
      description: 1,
      createdAt: 1,
    };
    const options = Pagination.options(pages, PER_PAGES!, sortBy);
    const totalItems = await Service.find(query).countDocuments();
    const services = await Service.find(
      query,
      isManager ? null : select,
      options
    );
    return { services, totalItems };
  }
  static async exportService() {
    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet('Suplier');
    const services = await Service.find({ isDeleted: false });
    if (services.length <= 0) {
      throw new BadRequestError('Supliers not found');
    }
    sheet.columns = [
      { header: 'Mã dịch vụ', key: 'id', width: 25 },
      { header: 'Tên dịch vụ', key: 'name', width: 35 },
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
      {
        header: 'Giảm giá (%)',
        key: 'discount',
        width: 15,
      },
      {
        header: 'Thời gian (phút)',
        key: 'time',
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
    services.map((value, index) => {
      sheet.addRow({
        id: value.id,
        name: value.name,
        imageUrl: value.imageUrl,
        costPrice: value.costPrice,
        salePrice: value.salePrice,
        discount: value.discount,
        time: value.time,
        expire: value.expire,
        featured: value.featured === true ? 'Có' : 'Không',
        description: value.description,
        // isDeleted: value.isDeleted,
        createdAt: value.createdAt,
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
