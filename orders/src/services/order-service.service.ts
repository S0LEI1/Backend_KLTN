import { BadRequestError, NotFoundError } from '@share-package/common';
import { OrderDoc } from '../models/order';
import {
  OrderServiceM,
  OrderServiceDoc,
  UsageLog,
} from '../models/order-service';
import { ServiceDoc } from '../models/service';
import { Attrs } from './order.service';
import { ServiceService } from './service.service';
export interface ServiceInOrder {
  serviceId: string;
  name: string;
  imageUrl: string;
  salePrice: number;
  quantity: number;
  totalPrice: number;
  usageLogs: UsageLog[] | null;
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
        serviceId: orderService.service.id,
        name: orderService.service.name,
        imageUrl: orderService.service.imageUrl,
        salePrice: orderService.service.salePrice,
        quantity: orderService.quantity,
        totalPrice: orderService.totalPrice,
        usageLogs: orderService.usageLogs ? orderService.usageLogs : null,
      });
    }
    return { orderServices, serviceTotalPrice, servicesInPackage };
  }
  static async findByOrder(orderDoc: OrderDoc) {
    const orderServices = await OrderServiceM.find({
      order: orderDoc.id,
      isDeleted: false,
    }).populate('service');
    console.log(orderServices);

    const services: ServiceInOrder[] = [];
    for (const os of orderServices) {
      services.push({
        serviceId: os.service.id,
        name: os.service.name,
        imageUrl: os.service.imageUrl,
        salePrice: os.service.salePrice,
        quantity: os.quantity,
        totalPrice: os.totalPrice,
        usageLogs: os.usageLogs ?? null,
      });
    }
    return services;
  }
  static async addUsageLog(orderId: string, serviceId: string) {
    const orderService = await OrderServiceM.findOne({
      order: orderId,
      service: serviceId,
    });
    if (!orderService) throw new NotFoundError('Order-Service');
    let count = 0;
    let usageLogs: UsageLog[] = [];
    if (orderService.usageLogs) {
      usageLogs = orderService.usageLogs;
      count = orderService.usageLogs.filter(
        (item) => item.status === true
      ).length;
      console.log('count in:', count);

      console.log('Count', count);
      if (count >= orderService.quantity)
        throw new BadRequestError('Number of Uses Exhausted.');
    }
    const date = new Date();
    const newLog: UsageLog = {
      date: date,
      status: true,
    };
    usageLogs.push(newLog);
    orderService.set({ usageLogs: usageLogs });
    await orderService.save();
    return { orderService, count };
  }
  // static async updateUsageLog(
  //   orderId: string,
  //   serviceId: string,
  //   status: boolean,
  //   usageLogId: string,
  //   date: Date
  // ) {
  //   const orderService = await OrderServiceM.findOne({
  //     order: orderId,
  //     service: serviceId,
  //   });
  //   if (!orderService) throw new NotFoundError('Order-Service');
  //   let usageLogs: UsageLog[] = [];
  //   if (!orderService.usageLogs) throw new BadRequestError('Order-Servce have not usage log');
  //   const newLog: UsageLog = {
  //     date: date,
  //     status: status,
  //   };
  //   const updateLog = orderService.usageLogs.find((log) => log._id)
  //   usageLogs.push(newLog);
  //   orderService.set({ usageLogs: usageLogs });
  //   await orderService.save();
  //   return { orderService, count };
  // }
}
