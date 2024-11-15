import { NotFoundError, Pagination } from '@share-package/common';
import { Product } from '../models/product';
export class ProductService {
  static async readOne(id: string) {
    const query = Pagination.query();
    query._id = id;
    query.isDeleted = false;
    const product = await Product.findOne(query, {
      id: 1,
      name: 1,
      imageUrl: 1,
      salePrice: 1,
    });
    if (!product) throw new NotFoundError('Product');
    return product;
  }
}
