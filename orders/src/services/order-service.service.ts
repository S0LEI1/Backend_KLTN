import { BadRequestError } from '@share-package/common';
import { OrderDoc } from '../models/order';
import { OrderServiceM, OrderServiceDoc } from '../models/order-service';
import { ServiceDoc } from '../models/service';
import { Attrs } from './order.service';
import { ServiceService } from './service.service';
export interface ServiceInOrder {
  infor: ServiceDoc;
  quantity: number;
}
export class OrderServiceService {
  static async newOrderService(order: OrderDoc, attr: Attrs) {
    const orderServiceExist = await OrderServiceM.findOne({
      order: order.id,
      service: attr.id,
      isDeleted: false,
    }).populate('service');
    if (orderServiceExist) {
      if (attr.quantity === 0) orderServiceExist.set({ isDeleted: true });
      orderServiceExist.set({ quantity: attr.quantity });
      await orderServiceExist.save();
      return orderServiceExist;
    }
    if (attr.quantity <= 0)
      throw new BadRequestError(
        'Service quantity must be greater than or equal  1'
      );
    const { service, price } = await ServiceService.getService(attr);
    const orderService = OrderServiceM.build({
      order: order,
      service: service,
      quantity: attr.quantity,
      totalPrice: price,
    });
    await orderService.save();
    return orderService;
  }
  static async newOrderServices(order: OrderDoc, servicesAttr: Attrs[]) {
    const orderServices: OrderServiceDoc[] = [];
    const servicesInPackage: ServiceInOrder[] = [];
    let serviceTotalPrice: number = 0;
    for (const attr of servicesAttr) {
      const orderService = await this.newOrderService(order, attr);
      if (orderService.isDeleted === true) continue;
      orderServices.push(orderService);
      serviceTotalPrice += orderService.totalPrice;
      servicesInPackage.push({
        infor: orderService.service,
        quantity: orderService.quantity,
      });
    }
    return { orderServices, serviceTotalPrice, servicesInPackage };
  }
  static async findByOrder(orderDoc: OrderDoc) {
    const orderServices = await OrderServiceM.find({
      order: orderDoc.id,
      isDeleted: false,
    }).populate('service');
    const services: ServiceInOrder[] = [];
    for (const os of orderServices) {
      services.push({
        infor: os.service,
        quantity: os.quantity,
      });
    }
    return services;
  }
}
