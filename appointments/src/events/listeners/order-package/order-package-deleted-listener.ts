import {
  Listener,
  NotFoundError,
  OrderPackageDeletedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { OrderPackage } from '../../../models/order-package';

export class OrderPackageDeletedListener extends Listener<OrderPackageDeletedEvent> {
  subject: Subjects.OrderPackageDeleted = Subjects.OrderPackageDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderPackageDeletedEvent['data'], msg: Message) {
    const orderPackage = await OrderPackage.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!orderPackage) throw new NotFoundError('Order-Package not found');
    orderPackage.set({ isDeleted: true });
    await orderPackage.save();
    msg.ack();
  }
}
