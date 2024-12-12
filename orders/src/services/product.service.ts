import { Product, ProductDoc } from '../models/product';
import { NotFoundError } from '@share-package/common';
import { Attrs } from './order.service';

export class ProductService {
  static async getProduct(attrs: Attrs) {
    console.log(attrs);
    const product = await Product.findProduct(attrs.id);
    if (!product) throw new NotFoundError('Product');
    const price = product.salePrice * attrs.quantity;
    return { product, price };
  }
  static async getProducts(productAttrs: Attrs[]) {
    let totalPrice = 0;
    let products: ProductDoc[] = [];
    for (const productAttr of productAttrs) {
      const { product, price } = await this.getProduct(productAttr);
      products.push(product);
      totalPrice += price;
    }
    return { products, totalPrice };
  }
}
