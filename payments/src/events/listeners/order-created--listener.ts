import {
  BadRequestError,
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const existOrder = await Order.findOrderByEvent({
      id: data.id,
      version: 0,
    });
    if (existOrder) throw new BadRequestError('Order exist');
    const order = Order.build({
      id: data.id,
      customer: data.customer,
      creEmp: data.creEmp,
      status: data.status,
      createdAt: data.createdAt,
    });
    await order.save();
    msg.ack();
  }
}
