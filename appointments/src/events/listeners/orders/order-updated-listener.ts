import {
  Listener,
  NotFoundError,
  OrderUpdatedEvent,
  Subjects,
} from '@share-package/common';
import { queueGroupName } from '../queueGroupName';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { User } from '../../../models/user';

export class OrderUpdatedListener extends Listener<OrderUpdatedEvent> {
  subject: Subjects.OrderUpdated = Subjects.OrderUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderUpdatedEvent['data'], msg: Message) {
    const customer = await User.findOne({ _id: data.customer });
    if (!customer) throw new NotFoundError('Customer not found');
    const creator = await User.findOne({ _id: data.creator });
    if (!creator) throw new NotFoundError('Creator not found');
    const order = await Order.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!order) throw new NotFoundError('Order not found');
    order.set({
      customer: customer,
      creator: creator,
      status: data.status,
      postTaxTotal: data.postTaxTotal,
    });
    await order.save();
    msg.ack();
  }
}
