import { ProductDoc } from '../models/product';
import { ProductCreatedPublisher } from '../events/publishers/products/product-created-publisher';
import { natsWrapper } from '../nats-wrapper';
export class ProductPublisher {
  static new(product: ProductDoc) {
    new ProductCreatedPublisher(natsWrapper.client).publish({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      description: product.description,
      categoryId: product.category.id,
      suplierId: product.suplier.id,
      active: product.active,
    });
  }
}
