import mongoose, { ObjectId } from 'mongoose';
import { Order, OrderDoc } from '../models/order';
import {
  OrderPackage,
  OrderPackageDoc,
  ServiceEmbedded,
} from '../models/order-package';
import { Attrs } from './order.service';
import { PackageService } from './package.service';
import { ServiceService } from './service.service';
import { Package, PackageDoc } from '../models/package';
import { BadRequestError, NotFoundError } from '@share-package/common';
import { Service, ServiceDoc } from '../models/service';
import { UsageLog } from '../models/order-service';
import { OrderPackagePublisher } from './order-package-publisher.service';
export interface PackageInOrder {
  packageInfor: PackageDoc;
  services: { service: ServiceDoc; quantity: number }[];
  quantity: number;
  totalPrice?: number;
}
interface ServiceInPackage {
  serviceId: string;
  name: string;
  imageUrl: string;
  usageLogs: UsageLog[] | null;
  quantity: number;
  // salePrice: number;
  status: boolean;
}
export interface PackagePopulate {
  packageId: string;
  name: string;
  imageUrl: string;
  salePrice: number;
  services: ServiceInPackage[];
  quantity: number;
  totalPrice?: number;
}
export class OrderPackageService {
  static async newOrderPacakage(order: OrderDoc, attr: Attrs) {
    const orderPackageExist = await OrderPackage.findOne({
      order: order.id,
      package: attr.id,
      isDeleted: false,
    })
      .populate('package')
      .populate('order')
      .populate({ path: 'serviceEmbedded.service' });
    // get package and price
    const { existPackage, price } = await PackageService.getPackage(attr);
    //  get services and quantity in package
    const servicesInPackage = await ServiceService.getServiceInPackage(
      existPackage.id
    );

    const serviceEmbedded: ServiceEmbedded[] = [];
    servicesInPackage.map((serviceInPackage) => {
      serviceEmbedded.push({
        service: serviceInPackage.service,
        status: false,
        quantity: serviceInPackage.quantity,
      });
    });
    // const services = await Service.find({ _id: { $in: serviceIds } });
    if (orderPackageExist) {
      if (attr.quantity === 0) {
        orderPackageExist.set({ isDeleted: true });
        await orderPackageExist.save();
        OrderPackagePublisher.deletedOrderPackage(orderPackageExist);
        return { orderPackage: orderPackageExist, servicesInPackage };
      }
      if (attr.quantity === orderPackageExist.quantity) {
        return { orderPackage: orderPackageExist, servicesInPackage };
      }
      orderPackageExist.set({ quantity: attr.quantity });
      await orderPackageExist.save();
      OrderPackagePublisher.updateOrderPackage(orderPackageExist);
      return { orderPackage: orderPackageExist, servicesInPackage };
    }
    if (attr.quantity <= 0)
      throw new BadRequestError(
        'Package quantity must be greater than or equal  1'
      );
    const orderPackage = OrderPackage.build({
      order: order,
      package: existPackage,
      serviceEmbedded: serviceEmbedded,
      quantity: attr.quantity,
      totalPrice: price,
    });
    await orderPackage.save();
    OrderPackagePublisher.newOrderPackage(orderPackage);
    return { orderPackage, servicesInPackage };
  }
  static async newOrderPacakages(order: OrderDoc, packageAttrs: Attrs[]) {
    const orderPackages: OrderPackageDoc[] = [];
    const packagesInOrder: PackageInOrder[] = [];
    let packageTotalPrice: number = 0;
    for (const attr of packageAttrs) {
      const { orderPackage, servicesInPackage } = await this.newOrderPacakage(
        order,
        attr
      );
      if (orderPackage.isDeleted === true) continue;
      packageTotalPrice += orderPackage.totalPrice;
      packagesInOrder.push({
        packageInfor: orderPackage.package,
        services: servicesInPackage,
        quantity: orderPackage.quantity,
      });
    }
    return { orderPackages, packageTotalPrice, packagesInOrder };
  }
  static async getPackage(packageId: string) {
    const existPackage = await Package.findOne({
      _id: packageId,
      isDeleted: false,
    });
    if (!existPackage) throw new NotFoundError('Package');
    return existPackage;
  }
  static async getPackages(packageIds: string[]) {
    const packages: PackageDoc[] = [];
    for (const packageId of packageIds) {
      const existPackage = await this.getPackage(packageId);
      packages.push(existPackage);
    }
    return packages;
  }
  static async findByOrder(orderDoc: OrderDoc) {
    const orderPkgs = await OrderPackage.find({
      order: orderDoc.id,
      isDeleted: false,
    })
      .populate('package')
      .populate({ path: 'serviceEmbedded.service' });
    const packages: PackagePopulate[] = [];
    const servicesInPackage: ServiceInPackage[] = [];
    let totalPrice = 0;
    for (const op of orderPkgs) {
      op.serviceEmbedded.map((srv) => {
        servicesInPackage.push({
          serviceId: srv.service.id,
          name: srv.service.name,
          imageUrl: srv.service.imageUrl,
          // salePrice: srv.service,
          status: srv.status,
          quantity: srv.quantity,
          usageLogs: srv.usageLogs ?? null,
        });
      });
      totalPrice += op.package.salePrice * op.quantity;
      packages.push({
        packageId: op.package.id,
        name: op.package.name,
        imageUrl: op.package.imageUrl,
        salePrice: op.package.salePrice,
        services: servicesInPackage,
        quantity: op.quantity,
        totalPrice: totalPrice,
      });
    }
    return packages;
  }
  static async addUsageLog(
    orderId: string,
    packageId: string,
    serviceId: string
  ) {
    const orderPackage = await OrderPackage.findOne({
      order: orderId,
      package: packageId,
    }).populate({
      path: 'serviceEmbedded.service',
      select: 'id name imageUrl',
    });
    if (!orderPackage) throw new NotFoundError('Order-Package not found');
    const { serviceEmbedded } = orderPackage;
    let count = 0;
    let usageLogs: UsageLog[] = [];
    const date = new Date();
    const newLog: UsageLog = {
      date: date,
      status: true,
    };
    const serviceEmbeddeds: ServiceEmbedded[] = [];
    const service = await Service.findOne({
      _id: serviceId,
      isDeleted: false,
    });
    if (!service) throw new NotFoundError('Service');
    let serviceEmbeddedUpdate: ServiceEmbedded = {
      service: service,
      status: false,
      quantity: 0,
    };
    for (const serviceEbd of serviceEmbedded) {
      if (serviceEbd.service.id !== service.id) {
        serviceEmbeddeds.push(serviceEbd);
        continue;
      }
      if (serviceEbd.usageLogs) {
        // count status === true
        count = serviceEbd.usageLogs.filter(
          (item) => item.status === true
        ).length;
        if (count >= serviceEbd.quantity)
          throw new BadRequestError('Number of Uses Exhausted.');
        usageLogs = serviceEbd.usageLogs;
      }
      usageLogs.push(newLog);
      serviceEbd.usageLogs = usageLogs;
      serviceEmbeddedUpdate = serviceEbd;
      serviceEmbeddeds.push(serviceEbd);
    }
    orderPackage.set({ serviceEmbedded: serviceEmbeddeds });
    await orderPackage.save();
    return { serviceEmbeddedUpdate, count };
  }
}
