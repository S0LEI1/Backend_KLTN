import { NotFoundError, Pagination } from '@share-package/common';
import { Product } from '../models/product';
export class ProductService {
  static async readOne(id: string) {
    const query = Pagination.query();
    query._id = id;
    query.isDeleted = false;
    const product = await Product.findOne(query)
      .populate({ path: 'category', select: 'id name' })
      .populate({ path: 'suplier', select: 'id name' });
    if (!product) throw new NotFoundError('Product');
    return product;
  }
}
