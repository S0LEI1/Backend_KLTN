import {
  BadRequestError,
  Listener,
  NotFoundError,
  OrderDeletedEvent,
  OrderStatus,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Order } from '../../models/order';
import { version } from 'mongoose';

export class OrderDeletedListener extends Listener<OrderDeletedEvent> {
  subject: Subjects.OrderDeleted = Subjects.OrderDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderDeletedEvent['data'], msg: Message) {
    const existOrder = await Order.findOrderByEvent({
      id: data.id,
      version: data.version,
    });
    if (!existOrder) throw new NotFoundError('Order not found');
    existOrder.set({ isDeleted: false });
    await existOrder.save();
    msg.ack();
  }
}
