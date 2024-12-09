import {
  BadRequestError,
  NotFoundError,
  Pagination,
  UserType,
} from '@share-package/common';
import { Service, ServiceDoc } from '../models/service';
import { checkImage } from '../utils/check-image';
import { AwsServices } from './aws.service';
import { Check } from '../utils/check-type';
import { calcSalePrice } from '../utils/calcSalePrice';
import { ServicePublishers } from './services.publisher.service';
import exceljs from 'exceljs';
import { getIO } from '../socket';
import _ from 'lodash';
import { PackageService } from '../models/package-service';
const PER_PAGE = process.env.PER_PAGE;
export class ServiceServices {
  static async new(
    name: string,
    file: Express.Multer.File,
    description: string,
    costPrice: number,
    time: number,
    expire: number,
    code: string
  ) {
    const imageUrl = await AwsServices.uploadFile(file);
    const existService = await Service.findOne({
      $or: [{ name: name }, { code: code }],
      isDeleted: false,
    });
    if (existService)
      throw new BadRequestError('service name or service code already exists');
    const service = Service.build({
      name: name,
      imageUrl: imageUrl,
      description: description,
      costPrice: _.round(costPrice),
      time: time,
      expire: expire,
      code: code,
    });
    await service.save();
    ServicePublishers.new(service);
    getIO().emit('services', {
      action: 'create',
      service,
    });
    return service;
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
    timeRange: string,
    time: string,
    expireRange: string,
    expire: string
  ) {
    const query = Pagination.query();
    const sort = Pagination.query();
    query.isDeleted = false;
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
    const highTime = 90;
    const lowTime = 30;
    if (timeRange === 'hightime') query.time = { $gt: highTime };
    if (timeRange === 'lowtime') query.time = { $lt: lowTime };
    if (timeRange === 'mediumtime')
      query.time = { $gte: lowTime, $lte: highTime };
    const highExpire = 30;
    const lowExpire = 15;
    if (expireRange === 'highexpire') query.expire = { $gt: highExpire };
    if (expireRange === 'lowexpire') query.expire = { $lt: lowExpire };
    if (expireRange === 'mediumexpire')
      query.expire = { $gte: lowExpire, $lte: highExpire };
    if (featured === 'true') query.featured = true;
    if (featured === 'false') query.featured = false;
    // sort
    if (name === 'asc') sort.name = 1;
    if (name === 'desc') sort.name = -1;
    if (price === 'asc') sort.salePrice = 1;
    if (price === 'desc') sort.salePrice = -1;
    if (discount === 'asc') sort.discount = 1;
    if (discount === 'desc') sort.discount = -1;
    if (time === 'asc') sort.time = 1;
    if (time === 'desc') sort.time = -1;
    if (expire === 'asc') sort.expire = 1;
    if (expire === 'desc') sort.expire = -1;
    const select = {
      costPrice: 0,
      isDeleted: 0,
    };

    const options = Pagination.options(pages, PER_PAGE!, sort);
    console.log('options', options);
    console.log('query', query);
    const services = await Service.find(
      query,
      isManager ? null : select,
      options
    );
    console.log(isManager);

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
    expire: number,
    code: string
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
      code: code,
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
    await PackageService.updateMany({ service: id }, { isDeleted: true });
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
    const sort = Pagination.query();
    if (sortBy === 'asc') sort.name = 1;
    if (sortBy === 'desc') sort.name = -1;
    const options = Pagination.options(pages, PER_PAGE!, sort);
    const totalItems = await Service.find(query).countDocuments();
    const services = await Service.find(query, isManager ? null : select, sort);
    return { services, totalItems };
  }
  static async exportService() {
    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet('Dịch vụ');
    const services = await Service.find({ isDeleted: false });
    if (services.length <= 0) {
      throw new BadRequestError('Services not found');
    }
    sheet.columns = [
      { header: 'Mã dịch vụ', key: 'code', width: 25 },
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
        code: value.code,
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
  static async importService(file: Express.Multer.File) {
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(file.path);
    const services: ServiceDoc[] = [];
    const existServices: ServiceDoc[] = [];
    for (const worksheet of workbook.worksheets) {
      const rowNumber = worksheet.rowCount;
      for (let i = 2; i <= rowNumber; i++) {
        const row = worksheet.getRow(i);
        if (!row.hasValues) {
          continue;
        }
        const existService = await Service.findOne({
          name: row.getCell(2).value as string,
          isDeleted: false,
        });
        if (existService) {
          existServices.push(existService);
          continue;
        }
        const service = Service.build({
          name: row.getCell(2).value as string,
          costPrice: row.getCell(4).value as number,
          salePrice: row.getCell(5).value as number,
          imageUrl: row.getCell(3).value as string,
          time: row.getCell(7).value as number,
          expire: row.getCell(8).value as number,
          description: row.getCell(10).value as string,
          code: row.getCell(1).value as string,
        });
        await service.save();
        ServicePublishers.new(service);
        services.push(service);
      }
    }
    return { services, existServices };
  }
}
