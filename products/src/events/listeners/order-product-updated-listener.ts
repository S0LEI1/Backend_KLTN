import {
  Listener,
  OrderProductUpdatedEvent,
  Subjects,
  NotFoundError,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Product } from '../../models/product';
import { ProductPublisher } from '../../services/product.publisher.service';
export class OrderProductUpdatedListener extends Listener<OrderProductUpdatedEvent> {
  subject: Subjects.OrderProductUpdated = Subjects.OrderProductUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderProductUpdatedEvent['data'], msg: Message) {
    const product = await Product.findOne({
      _id: data.productId,
      isDeleted: false,
    })
      .populate('category')
      .populate('suplier');
    if (!product) throw new NotFoundError('Product not found');
    const newQuantity = product.quantity - data.quantity;
    product.set({ quantity: newQuantity });
    await product.save();
    ProductPublisher.update(product);
    msg.ack();
  }
}
