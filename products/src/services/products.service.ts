import { NotFoundError, UserType } from '@share-package/common';
import { Category } from '../models/category';
import { Product, ProductDoc } from '../models/product';
import { Suplier } from '../models/suplier';
import { checkImage } from '../utils/check-image';
import { AwsServices } from './aws.service';
import { Convert } from '../utils/convert';
interface ProductAttrs {
  name: string;
  description: string;
  categoryId: string;
  suplierId: string;
  expire: Date;
  costPrice: number;
  quantity: number;
  file?: Express.Multer.File;
  discount?: number;
}
const PER_PAGE = process.env.PER_PAGE;
export class ProductService {
  static async new(productAttrs: ProductAttrs) {
    try {
      const existProduct = await Product.findByName(productAttrs.name);
      const category = await Category.findCategory(productAttrs.categoryId);
      const suplier = await Suplier.findSuplier(productAttrs.suplierId);
      checkImage(productAttrs.file!);
      const imageUrl = await AwsServices.uploadFile(productAttrs.file!);
      const salePrice =
        productAttrs.costPrice + (productAttrs.costPrice * 10) / 100;
      const product = Product.build({
        name: productAttrs.name,
        description: productAttrs.description,
        category: category!,
        suplier: suplier!,
        imageUrl: imageUrl!,
        active: true,
        expire: productAttrs.expire,
        costPrice: productAttrs.costPrice,
        salePrice: salePrice,
        quantity: productAttrs.quantity,
      });
      await product.save();
      return product;
    } catch (error) {
      console.log(error);
    }
  }
  static async readAll(pages: number, sortBy: string) {
    const totalItems = await Product.find({ active: true }).countDocuments();
    const products = await Product.find({ active: true })
      .sort({ createdAt: sortBy === 'asc' ? 1 : -1 })
      .skip((pages - 1) * parseInt(PER_PAGE!))
      .limit(parseInt(PER_PAGE!))
      .populate({ path: 'category', select: 'id name description' })
      .populate({ path: 'suplier', select: 'id name description' })
      .exec();
    if (!products) throw new NotFoundError('Products');
    return { products, totalItems };
  }
  static convertProduct(product: ProductDoc, type: UserType) {
    return Convert.product(product, type);
  }
  static convertProducts(products: ProductDoc[], type: UserType) {
    return Convert.products(products, type);
  }
  static async readOne(id: string) {
    const product = await Product.findProduct(id);
    if (!product) throw new NotFoundError('Product');
    return product;
  }
  static async update(id: string, productAttrs: ProductAttrs) {
    const product = await Product.findProduct(id);
    if (!product) throw new NotFoundError('Product');
    const category = await Category.findCategory(productAttrs.categoryId);
    const suplier = await Suplier.findSuplier(productAttrs.suplierId);
    let imageUrl = product.imageUrl;
    if (productAttrs.file) {
      await AwsServices.deleteFile(product.imageUrl);
      imageUrl = await Convert.image(productAttrs.file);
    }
    product.set({
      name: productAttrs.name,
      description: productAttrs.description,
      category: category,
      suplier: suplier,
      imageUrl: imageUrl,
      expire: productAttrs.expire,
      costPrice: productAttrs.costPrice,
      quantity: productAttrs.quantity,
    });
    await product.save();
    return product;
  }
  static async disable(id: string) {
    const product = await Product.findProduct(id);
    if (!product) throw new NotFoundError('Product');
    product.set({ active: !product.active });
    await product.save();
    return product;
  }
  static async sortByCategoryOrSuplier(
    id: string,
    sortBy: string,
    pages: number
  ) {
    const totalItems = await Product.find({
      $and: [{ active: true }, { $or: [{ caterory: id }, { suplier: id }] }],
    }).countDocuments();
    const products = await Product.find({
      $and: [{ active: true }, { $or: [{ category: id }, { suplier: id }] }],
    })
      .sort({ createdAt: sortBy === 'asc' ? 1 : -1 })
      .skip((pages - 1) * parseInt(PER_PAGE!))
      .limit(parseInt(PER_PAGE!))
      .populate({ path: 'category', select: 'id name description' })
      .populate({ path: 'suplier', select: 'id name description' })
      .exec();
    if (!products) throw new NotFoundError('Products');
    return { products, totalItems };
  }
  static async readAllByName(name: string, sortBy: string, pages: number) {
    const totalItems = await Product.find({
      name: new RegExp(name, 'i'),
      active: true,
    }).countDocuments();
    const products = await Product.find({
      name: new RegExp(name, 'i'),
      active: true,
    })
      .sort({ createdAt: sortBy === 'asc' ? 1 : -1 })
      .skip((pages - 1) * parseInt(PER_PAGE!))
      .limit(parseInt(PER_PAGE!))
      .populate({ path: 'category', select: 'id name description' })
      .populate({ path: 'suplier', select: 'id name description' })
      .exec();
    if (!products) throw new NotFoundError('Products');
    return { products, totalItems };
  }
  static async readAllProductUnactive(pages: number, sortBy: string) {
    const totalItems = await Product.find({ active: false }).countDocuments();
    const products = await Product.find({ active: false })
      .sort({ createdAt: sortBy === 'asc' ? 1 : -1 })
      .skip((pages - 1) * parseInt(PER_PAGE!))
      .limit(parseInt(PER_PAGE!))
      .populate({ path: 'category', select: 'id name description' })
      .populate({ path: 'suplier', select: 'id name description' })
      .exec();
    if (!products) throw new NotFoundError('Products');
    return { products, totalItems };
  }
}
