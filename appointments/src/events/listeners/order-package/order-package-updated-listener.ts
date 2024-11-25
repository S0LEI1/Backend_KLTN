import {
  Listener,
  NotFoundError,
  OrderPackageUpdatedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { OrderPackage, ServiceEmbedded } from '../../../models/order-package';
import { Order } from '../../../models/order';
import { Package } from '../../../models/package';
import { Service } from '../../../models/service';

export class OrderPackageUpdatedListener extends Listener<OrderPackageUpdatedEvent> {
  subject: Subjects.OrderPackageUpdated = Subjects.OrderPackageUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderPackageUpdatedEvent['data'], msg: Message) {
    const orderPackage = await OrderPackage.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!orderPackage) throw new NotFoundError('Order-Package not found');
    const order = await Order.findOrder(data.order);
    if (!order) throw new NotFoundError('Order not found');
    const existPackage = await Package.findPackage(data.package);
    if (!existPackage) throw new NotFoundError('Package not found');
    const servicesEmbedded: ServiceEmbedded[] = [];
    for (const serviceE of data.serviceEmbedded) {
      const service = await Service.findService(serviceE.service);
      if (!service) throw new NotFoundError('Service not found');
      servicesEmbedded.push({
        service: service,
        status: serviceE.status,
        quantity: serviceE.quantity,
        usageLogs: serviceE.usageLogs,
      });
    }
    orderPackage.set({
      order: order,
      package: existPackage,
      serviceEmbedded: servicesEmbedded,
      quantity: data.quantity,
      totalPrice: data.totalPrice,
    });
    await orderPackage.save();
    msg.ack();
  }
}
