import {
  Listener,
  NotFoundError,
  OrderDeletedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Order } from '../../../models/order';

export class OrderDeletedListener extends Listener<OrderDeletedEvent> {
  subject: Subjects.OrderDeleted = Subjects.OrderDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderDeletedEvent['data'], msg: Message) {
    const order = await Order.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!order) throw new NotFoundError('Order not found');
    order.set({ isDeleted: data.isDeleted });
    await order.save();
    msg.ack();
  }
}
