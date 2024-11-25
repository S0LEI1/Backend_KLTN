import {
  Listener,
  NotFoundError,
  OrderServiceDeletedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { OrderServiceM } from '../../../models/order-service';

export class OrderServiceDeletedListener extends Listener<OrderServiceDeletedEvent> {
  subject: Subjects.OrderServiceDeleted = Subjects.OrderServiceDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderServiceDeletedEvent['data'], msg: Message) {
    const orderService = await OrderServiceM.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!orderService) throw new NotFoundError('Order-Service not found');
    orderService.set({ isDeleted: true });
    await orderService.save();
    msg.ack();
  }
}
