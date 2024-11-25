import {
  Listener,
  NotFoundError,
  OrderServiceCreatedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { OrderServiceM } from '../../../models/order-service';
import { Order } from '../../../models/order';
import { Service } from '../../../models/service';

export class OrderServiceCreatedListener extends Listener<OrderServiceCreatedEvent> {
  subject: Subjects.OrderServiceCreated = Subjects.OrderServiceCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderServiceCreatedEvent['data'], msg: Message) {
    const order = await Order.findOrder(data.order);
    if (!order) throw new NotFoundError('Order not found');
    const service = await Service.findService(data.service);
    if (!service) throw new NotFoundError('Service not found');
    const orderService = OrderServiceM.build({
      id: data.id,
      order: order,
      service: service,
      quantity: data.quantity,
      totalPrice: data.totalPrice,
    });
    await orderService.save();
    msg.ack();
  }
}
