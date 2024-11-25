import {
  Listener,
  NotFoundError,
  OrderCreatedEvent,
  Subjects,
} from '@share-package/common';
import { queueGroupName } from '../queueGroupName';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { User } from '../../../models/user';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const customer = await User.findOne({ _id: data.customer });
    if (!customer) throw new NotFoundError('Customer not found');
    const creator = await User.findOne({ _id: data.creator });
    if (!creator) throw new NotFoundError('Creator not found');
    const order = Order.build({
      id: data.id,
      customer: customer,
      creator: creator,
      status: data.status,
    });
    await order.save();
    msg.ack();
  }
}
