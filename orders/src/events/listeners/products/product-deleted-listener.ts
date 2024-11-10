import {
  Listener,
  NotFoundError,
  ProductDeletedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Product } from '../../../models/product';

export class ProductDeletedListener extends Listener<ProductDeletedEvent> {
  subject: Subjects.ProductDeleted = Subjects.ProductDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: ProductDeletedEvent['data'], msg: Message) {
    const product = await Product.findProduct(data.id);
    if (!product) throw new NotFoundError('Product');
    product.set({
      isDeleted: data.isDeleted,
    });
    await product.save();
    msg.ack();
  }
}
