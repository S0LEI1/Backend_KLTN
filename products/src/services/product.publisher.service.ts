import { ProductDoc } from '../models/product';
import { ProductCreatedPublisher } from '../events/publishers/products/product-created-publisher';
import { natsWrapper } from '../nats-wrapper';
import { ProductUpdatedPublisher } from '../events/publishers/products/product-updated-publisher';
import { ProductDeletedPublisher } from '../events/publishers/products/product-deleted-publisher';
export class ProductPublisher {
  static new(product: ProductDoc) {
    new ProductCreatedPublisher(natsWrapper.client).publish({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      description: product.description,
      categoryId: product.category.id,
      suplierId: product.suplier.id,
      expire: product.expire,
      salePrice: product.salePrice!,
      quantity: product.quantity,
    });
  }
  static update(productDoc: ProductDoc) {
    new ProductUpdatedPublisher(natsWrapper.client).publish({
      id: productDoc.id,
      name: productDoc.name,
      imageUrl: productDoc.name,
      description: productDoc.description,
      suplierId: productDoc.suplier.id,
      categoryId: productDoc.category.id,
      expire: productDoc.expire,
      salePrice: productDoc.salePrice!,
      quantity: productDoc.quantity,
      version: productDoc.version,
    });
  }
  static delete(productDoc: ProductDoc) {
    new ProductDeletedPublisher(natsWrapper.client).publish({
      id: productDoc.id,
      version: productDoc.version,
      isDeleted: productDoc.isDeleted!,
    });
  }
}
