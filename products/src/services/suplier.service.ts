import {
  BadRequestError,
  NotFoundError,
  Pagination,
} from '@share-package/common';
import { Suplier } from '../models/suplier';
import { ProductService } from './products.service';
import { Convert } from '../utils/convert';
const PER_PAGE = process.env.PER_PAGE;
export class SuplierServices {
  static async create(name: string, description: string) {
    const existSuplier = await Suplier.findOne({ name: name });
    if (existSuplier) throw new BadRequestError('Suplier name existing');
    const suplier = Suplier.build({
      name: name,
      description: description,
    });
    await suplier.save();
    return suplier;
  }
  static async readAll(pages: string, sortBy: string) {
    const query = Pagination.query();
    query.isDeleted = false;
    const options = Pagination.options(pages, PER_PAGE!, sortBy);
    const totalItems = await Suplier.find(query).countDocuments();
    const supliers = await Suplier.find(query, null, options);
    if (!supliers) throw new NotFoundError('Categories');
    return { supliers, totalItems };
  }
  static async readOne(
    id: string,
    isManager: boolean,
    pages: string,
    sortBy: string
  ) {
    const query = Pagination.query();
    query._id = id;
    query.isDeleted = false;
    const suplier = await Suplier.findOne(query);
    if (!suplier) throw new NotFoundError('Suplier');
    const { products, totalItems } =
      await ProductService.sortByCategoryOrSuplier(
        id,
        sortBy as string,
        pages as string,
        isManager
      );
    const convertProducts = Convert.products(products);
    return { suplier, products: convertProducts, totalItems };
  }
  static async findByName(name: string, pages: string, sortBy: string) {
    const query = Pagination.query();
    query.name = new RegExp(name, 'i');
    query.isDeleted = false;
    const options = Pagination.options(pages, PER_PAGE!, sortBy);
    const suplier = await Suplier.find(query, null, options);
    if (!suplier) throw new NotFoundError('Suplier by name');
    return suplier;
  }
  static async update(id: string, name: string, description: string) {
    const existSuplier = await Suplier.findById(id);
    if (!existSuplier) throw new NotFoundError('Suplier update');
    existSuplier.set({ name: name, description: description });
    await existSuplier.save();
    return existSuplier;
  }
  static async delete(id: string) {
    const query = Pagination.query();
    query._id = id;
    query.isDeleted = false;
    const existSuplier = await Suplier.findOne(query);
    if (!existSuplier) throw new NotFoundError('Suplier delete');
    existSuplier.set({ isDeleted: true });
    await existSuplier.save();
    return existSuplier;
  }
}
