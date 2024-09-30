import { NotFoundError } from '@share-package/common';
import { Category } from '../models/category';
import { Product } from '../models/product';
import { Suplier } from '../models/suplier';
import { checkImage } from '../utils/check-image';
import { AwsServices } from './aws.service';
interface ProductAttrs {
  name: string;
  description: string;
  categoryId: string;
  suplierId: string;
  expire: Date;
  costPrice: number;
  salePrice: number;
  quantity: number;
  file: Express.Multer.File;
}
const PER_PAGE = process.env.PER_PAGE;
export class ProductService {
  static async new(productAttrs: ProductAttrs) {
    try {
      const existProduct = await Product.findByName(productAttrs.name);
      const category = await Category.findCategory(productAttrs.categoryId);
      const suplier = await Suplier.findSuplier(productAttrs.suplierId);
      checkImage(productAttrs.file);
      const imageUrl = await AwsServices.uploadFile(productAttrs.file);
      const product = Product.build({
        name: productAttrs.name,
        description: productAttrs.description,
        category: category!,
        suplier: suplier!,
        imageUrl: imageUrl!,
        active: true,
        expire: productAttrs.expire,
        costPrice: productAttrs.costPrice,
        salePrice: productAttrs.salePrice,
        quantity: productAttrs.quantity,
      });
      await product.save();
      return product;
    } catch (error) {
      console.log(error);
    }
  }
  static async readAll(pages: number) {
    const totalItems = await Product.find().countDocuments();
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip((pages - 1) * parseInt(PER_PAGE!))
      .limit(parseInt(PER_PAGE!))
      .populate({ path: 'category', select: 'id name description' })
      .populate({ path: 'suplier', select: 'id name description' })
      .exec();
    if (!products) throw new NotFoundError('Products');
    return { products, totalItems };
  }
}
