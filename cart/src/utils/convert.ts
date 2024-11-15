import { ProductDoc } from '../models/product';

interface ConvertProduct {
  id: string;
  name: string;
  description: string;
  categoryId?: string;
  categoryName?: string;
  suplierId?: string;
  suplierName?: string;
  imageUrl: string;
  expire: Date;
  discount: number;
  featured: boolean;
  salePrice: number;
  quantity: number;
  createdAt: Date;
  version: number;
  code: string;
}
export class Convert {
  static product(productDoc: ProductDoc) {
    const convertProduct: ConvertProduct = {
      id: productDoc.id,
      name: productDoc.name,
      description: productDoc.description,
      categoryId: productDoc.category?.id,
      categoryName: productDoc.category?.name,
      suplierId: productDoc.suplier?.id,
      suplierName: productDoc.suplier?.name,
      imageUrl: productDoc.imageUrl,
      expire: productDoc.expire,
      salePrice: productDoc.salePrice!,
      quantity: productDoc.quantity,
      version: productDoc.version,
      featured: productDoc.featured!,
      discount: productDoc.discount,
      createdAt: productDoc.createdAt,
      code: productDoc.code,
    };
    return convertProduct;
  }
  static products(productDocs: ProductDoc[]) {
    const convertProducts = [];
    for (const product of productDocs) {
      const convertProduct = this.product(product);
      convertProducts.push(convertProduct);
    }
    return convertProducts;
  }
}
