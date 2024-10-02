import { BadRequestError, NotFoundError } from '@share-package/common';
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
      salePrice: 0,
    });
    await service.save();
    return service;
  }
  static async readAll(pages: string, sortBy: string) {
    const query = Pagination.query();
    query.active = true;
    query.isDeleted = false;
    const select = { name: 1, imageUrl: 1, costPrice: 1 };
    const options = Pagination.options(pages, PER_PAGES!, sortBy);
    const services = await Service.find(query, { name: 1 }, options);
    const totalItems = await Service.find(query).countDocuments();
    return { services, totalItems };
  }
  static async readOne(id: string) {
    const service = await Service.findOne({ _id: id, active: true });
    if (!service) throw new NotFoundError('Service');
    return service;
  }
  static async readOneForManager(id: string) {
    const service = await Service.findById({ _id: id });
    if (!service) throw new NotFoundError('Service');
    return service;
  }
  static async update(id: string) {}
}
