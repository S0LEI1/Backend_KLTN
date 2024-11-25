import {
  BadRequestError,
  Listener,
  OrderUpdatedEvent,
  OrderStatus,
  Subjects,
  NotFoundError,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Order } from '../../models/order';

export class OrderUpdatedListener extends Listener<OrderUpdatedEvent> {
  subject: Subjects.OrderUpdated = Subjects.OrderUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderUpdatedEvent['data'], msg: Message) {
    const existOrder = await Order.findOrderByEvent({
      id: data.id,
      version: data.version,
    });
    console.log(data);
    if (!existOrder) throw new NotFoundError('Order not found');
    existOrder.set({
      customer: data.customer,
      creator: data.creator,
      status: data.status,
      createdAt: data.createdAt,
      postTaxTotal: data.postTaxTotal,
    });
    await existOrder.save();
    msg.ack();
  }
}
