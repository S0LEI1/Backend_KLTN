import {
  Listener,
  NotFoundError,
  OrderStatus,
  PaymentCreatedEvent,
  PaymentType,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../listeners/queueGroupName';
import { Order } from '../../models/order';
import { OrderPublisher } from '../../services/orders.publisher.service';
import { OrderProduct } from '../../models/order-product';
import { OrderProductUpdatedPublisher } from '../publisher/order-product-updated-publisher';
import { natsWrapper } from '../../nats-wrapper';
export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findOrder(data.orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (data.type === PaymentType.Cash)
      order.set({ status: OrderStatus.CashPayment });
    if (data.type === PaymentType.Online)
      order.set({ status: OrderStatus.Complete });
    await order.save();
    OrderPublisher.updateOrder(order);
    const orderProducts = await OrderProduct.find({
      order: order.id,
      isDeleted: false,
    })
      .populate('order')
      .populate('product');
    if (orderProducts) {
      for (const op of orderProducts) {
        new OrderProductUpdatedPublisher(natsWrapper.client).publish({
          productId: op.product.id,
          quantity: op.quantity,
        });
      }
    }
    msg.ack();
  }
}
