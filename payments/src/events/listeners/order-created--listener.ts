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
import { User } from '../../models/user';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    console.log(data);

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
      postTaxTotal: data.postTaxTotal,
    });
    await order.save();
    msg.ack();
  }
}
