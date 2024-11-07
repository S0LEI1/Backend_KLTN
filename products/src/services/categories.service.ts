import {
  BadRequestError,
  NotFoundError,
  Pagination,
} from '@share-package/common';
import { Category, CategoryDoc } from '../models/category';
import { Product } from '../models/product';
import { ProductService } from './products.service';
import { Convert } from '../utils/convert';
import exceljs from 'exceljs';
const PER_PAGE = process.env.PER_PAGE;
export class CategoriesServices {
  static async create(name: string, description: string, code: string) {
    const existCategory = await Category.findOne({
      name: name,
    });
    if (existCategory) throw new BadRequestError('Category existing');
    const category = Category.build({
      name: name,
      description: description,
      code: code,
    });
    await category.save();
    return category;
  }
  static async readAll(pages: string, sortBy: string) {
    const query = Pagination.query();
    query.isDeleted = false;
    const sort = Pagination.query();
    if (sortBy === 'asc') sort.name = 1;
    if (sortBy === 'desc') sort.name = -1;
    const options = Pagination.options(pages, PER_PAGE as string, sort);
    const totalItems = await Category.find(query).countDocuments();
    const categories = await Category.find(query, null, options);
    if (!categories) throw new NotFoundError('Categories');
    return { categories, totalItems };
  }
  static async readOne(
    id: string,
    pages: string,
    sortBy: string,
    isManager: boolean
  ) {
    const query = Pagination.query();
    query._id = id;
    query.isDeleted = false;
    // const pQuery = Pagination.query();
    // pQuery.category = id;
    // pQuery.isDeleted = false;
    // const pOptions = Pagination.options(pages, PER_PAGE!, sortBy);
    const category = await Category.findOne(query);
    if (!category) throw new NotFoundError('Category');
    return category;
  }
  static async findByName(name: string, pages: string, sortBy: string) {
    const query = Pagination.query();
    query.name = new RegExp(name, 'i');
    query.isDeleted = false;
    const sort = Pagination.query();
    if (sortBy === 'asc') sort.name = 1;
    if (sortBy === 'desc') sort.name = -1;
    const options = Pagination.options(pages, PER_PAGE!, sort);
    const category = await Category.find(query, {}, options);
    if (!category) throw new NotFoundError('Category by name');
    return category;
  }
  static async update(
    id: string,
    name: string,
    description: string,
    code: string
  ) {
    const existCategory = await Category.findById(id);
    if (!existCategory) throw new NotFoundError('Category update');
    existCategory.set({ name: name, description: description, code: code });
    await existCategory.save();
    return existCategory;
  }
  static async delete(id: string) {
    const query = Pagination.query();
    query._id = id;
    query.isDeleted = false;
    const existCategory = await Category.findOne(query);
    if (!existCategory) throw new NotFoundError('Category delete');
    existCategory.set({ isDeleted: true });
    await existCategory.save();
    return existCategory;
  }
  static async exportCategories() {
    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet('Loại sản phẩm');
    const categories = await Category.find({ isDeleted: false });
    if (categories.length <= 0) {
      throw new BadRequestError('Categories not found');
    }
    sheet.columns = [
      { header: 'Mã loại sản phẩm', key: 'code', width: 20 },
      { header: 'Tên loại sản phẩm', key: 'name', width: 35 },
      {
        header: 'Mô tả',
        key: 'description',
        width: 50,
      },
    ];
    categories.map((value, index) => {
      sheet.addRow({
        code: value.code,
        name: value.name,
        description: value.description,
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
