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
    msg.ack();
  }
}
