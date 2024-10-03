import { NotFoundError, Pagination, UserType } from '@share-package/common';
import { Category } from '../models/category';
import { Product, ProductDoc } from '../models/product';
import { Suplier } from '../models/suplier';
import { checkImage } from '../utils/check-image';
import { AwsServices } from './aws.service';
import { Convert } from '../utils/convert';
import { Check } from '../utils/check-type';
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
  static async readAll(pages: string, sortBy: string, isManager: boolean) {
    const query = Pagination.query();
    query.isDeleted = false;
    const options = Pagination.options(pages, PER_PAGE!, sortBy);
    const totalItems = await Product.find(query).countDocuments();
    const products = await Product.find(
      query,
      isManager ? null : { costPrice: 0 },
      options
    )
      .populate({
        path: 'category',
        match: { isDeleted: false },
        select: 'id name description',
      })
      .populate({
        path: 'suplier',
        match: { isDeleted: false },
        select: 'id name description',
      })
      .exec();
    if (!products) throw new NotFoundError('Products');
    // const convertProduct = Convert.products(products);
    return { products, totalItems };
  }
  // static convertProduct(product: ProductDoc, type: UserType) {
  //   return Convert.product(product, type);
  // }
  // static convertProducts(products: ProductDoc[], type: UserType) {
  //   return Convert.products(products, type);
  // }
  static async readOne(id: string, isManager: boolean) {
    const query = Pagination.query();
    query._id = id;
    query.isDeleted = false;
    const product = await Product.findOne(
      query,
      isManager ? null : { costPrice: 0 },
      null
    )
      .populate('category')
      .populate('suplier');
    if (!product) throw new NotFoundError('Product');
    const convertProduct = Convert.product(product);
    return convertProduct;
  }
  static async update(id: string, productAttrs: ProductAttrs) {
    const query = Pagination.query();
    query._id = id;
    query.isDeleted = false;
    const product = await Product.findOne(query);
    if (!product) throw new NotFoundError('Product');
    const category = await Category.findCategory(productAttrs.categoryId);
    const suplier = await Suplier.findSuplier(productAttrs.suplierId);
    let imageUrl = product.imageUrl;
    if (productAttrs.file) {
      await AwsServices.deleteFile(product.imageUrl);
      Check.checkImage(productAttrs.file);
      imageUrl = await AwsServices.uploadFile(productAttrs.file);
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
    pages: string,
    isManager: boolean
  ) {
    const options = Pagination.options(pages, PER_PAGE!, sortBy);
    const totalItems = await Product.find({
      $and: [
        { isDeleted: false },
        { $or: [{ category: id }, { suplier: id }] },
      ],
    }).countDocuments();
    const products = await Product.find(
      {
        $and: [
          { isDeleted: false },
          { $or: [{ category: id }, { suplier: id }] },
        ],
      },
      isManager ? null : { costPrice: 0 },
      options
    )
      .populate({
        path: 'category',
        match: { isDeleted: false },
        select: 'id name description ',
      })
      .populate({
        path: 'suplier',
        match: { isDeleted: false },
        select: 'id name description ',
      });
    if (!products) throw new NotFoundError('Products');
    return { products, totalItems };
  }
  static async readAllByName(
    name: string,
    sortBy: string,
    pages: string,
    isManager: boolean
  ) {
    const query = Pagination.query();
    query.name = new RegExp(name, 'i');
    query.isDeleted = false;
    const options = Pagination.options(pages, PER_PAGE!, sortBy);
    const totalItems = await Product.find(query).countDocuments();
    const products = await Product.find(
      query,
      isManager ? null : { costPrice: 0 },
      options
    )
      .populate({
        path: 'category',
        match: { isDeleted: false },
        select: 'id name description',
      })
      .populate({
        path: 'suplier',
        match: { isDeleted: false },
        select: 'id name description',
      })
      .exec();
    if (!products) throw new NotFoundError('Products');
    const convertProduct = Convert.products(products);
    return { products: convertProduct, totalItems };
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
