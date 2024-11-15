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
    if (!existOrder) throw new NotFoundError('Order not found');
    existOrder.set({
      id: data.id,
      customer: data.customer,
      creEmp: data.creEmp,
      status: data.status,
      createdAt: data.createdAt,
    });
    await existOrder.save();
    msg.ack();
  }
}
