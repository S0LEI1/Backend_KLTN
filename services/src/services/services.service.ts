import {
  BadRequestError,
  NotFoundError,
  UserType,
} from '@share-package/common';
import { Service } from '../models/service';
import { checkImage } from '../utils/check-image';
import { AwsServices } from './aws.service';
import { Pagination } from '../utils/pagination';
const PER_PAGES = process.env.PER_PAGES;
export class ServiceServices {
  static async new(
    name: string,
    file: Express.Multer.File,
    description: string,
    costPrice: number
  ) {
    const imageUrl = await AwsServices.uploadFile(file);
    const existService = await Service.findOne({ name: name });
    if (existService) throw new BadRequestError('service already exists');
    const service = Service.build({
      name: name,
      imageUrl: imageUrl,
      active: true,
      description: description,
      costPrice: costPrice,
      salePrice: costPrice + (costPrice * 90) / 100,
    });
    await service.save();
    return service;
  }
  static async readAll(pages: string, sortBy: string, isManager: boolean) {
    const query = Pagination.query();
    query.isDeleted = false;
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
    };
    const service = await Service.find(query, isManager ? null : select, null);
    if (!service) throw new NotFoundError('Service');
    return service;
  }
  static async update(id: string) {}
}
