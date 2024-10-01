import { UserType } from '@share-package/common';
import { ProductDoc } from '../models/product';
import { AwsServices } from '../services/aws.service';
import { checkImage } from './check-image';
interface ConvertProduct {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  suplierId: string;
  suplierName: string;
  imageUrl: string;
  expire: Date;
  costPrice?: number;
  salePrice: number;
  quantity: number;
  active: boolean;
  version: number;
}
export class Convert {
  static product(productDoc: ProductDoc, type: UserType) {
    const convertProduct: ConvertProduct = {
      id: productDoc.id,
      name: productDoc.name,
      description: productDoc.description,
      categoryId: productDoc.category.id,
      categoryName: productDoc.category.name,
      suplierId: productDoc.suplier.id,
      suplierName: productDoc.suplier.name,
      imageUrl: productDoc.imageUrl,
      expire: productDoc.expire,
      costPrice: type === UserType.Manager ? productDoc.costPrice : undefined,
      salePrice: productDoc.salePrice,
      quantity: productDoc.quantity,
      active: productDoc.active!,
      version: productDoc.version,
    };
    return convertProduct;
  }
  static products(productDocs: ProductDoc[], type: UserType) {
    const convertProducts = [];
    for (const product of productDocs) {
      const convertProduct = this.product(product, type);
      convertProducts.push(convertProduct);
    }
    return convertProducts;
  }
  static async image(file: Express.Multer.File) {
    checkImage(file);
    const imageUrl = await AwsServices.uploadFile(file);
    return imageUrl;
  }
  static toBoolean(input: string): boolean | undefined {
    try {
      return JSON.parse(input.toLowerCase());
    } catch (e) {
      return undefined;
    }
  }
}
