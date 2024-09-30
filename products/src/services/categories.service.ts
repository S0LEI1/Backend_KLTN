import { BadRequestError, NotFoundError } from '@share-package/common';
import { Category, CategoryDoc } from '../models/category';

export class CategoriesServices {
  static async create(name: string, description: string) {
    const existCategory = await Category.findOne({ name: name });
    if (existCategory) throw new BadRequestError('Category existing');
    const category = Category.build({
      name: name,
      description: description,
    });
    await category.save();
    return category;
  }
  static async readAll() {
    const categories = Category.find();
    if (!categories) throw new NotFoundError('Categories');
    return categories;
  }
  static async readOne(id: string) {
    const category = await Category.findById(id);
    if (!category) throw new NotFoundError('Category');
    return category;
  }
  static async findByName(name: string) {
    const category = await Category.findOne({ name: name });
    if (!category) throw new NotFoundError('Category by name');
    return category;
  }
  static async update(id: string, name: string, description: string) {
    const existCategory = await Category.findById(id);
    if (!existCategory) throw new NotFoundError('Category update');
    existCategory.set({ name: name, description: description });
    await existCategory.save();
    return existCategory;
  }
  static async delete(id: string) {
    const existCategory = await Category.findById(id);
    if (!existCategory) throw new NotFoundError('Category delete');
    await Category.deleteOne({ _id: id });
    return existCategory;
  }
}
