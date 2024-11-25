import {
  Listener,
  NotFoundError,
  OrderServiceUpdatedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { OrderServiceM } from '../../../models/order-service';
import { Order } from '../../../models/order';
import { Service } from '../../../models/service';

export class OrderServiceUpdatedListener extends Listener<OrderServiceUpdatedEvent> {
  subject: Subjects.OrderServiceUpdated = Subjects.OrderServiceUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderServiceUpdatedEvent['data'], msg: Message) {
    const orderService = await OrderServiceM.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!orderService) throw new NotFoundError('Order-Service not found');
    const order = await Order.findOrder(data.order);
    if (!order) throw new NotFoundError('Order not found');
    const service = await Service.findService(data.service);
    if (!service) throw new NotFoundError('Service not found');
    order.set({
      order: order,
      service: service,
      quantity: data.quantity,
      totalPrice: data.totalPrice,
      usageLogs: data.usageLogs,
    });
    await orderService.save();
    msg.ack();
  }
}
