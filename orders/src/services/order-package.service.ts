import { ObjectId } from 'mongoose';
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
export interface PackageInOrder {
  packageInfor: PackageDoc;
  services: ServiceDoc[];
  quantity: number;
  totalPrice?: number;
}
interface ServiceInPackage {
  serviceId: string;
  name: string;
  imageUrl: string;
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
    }).populate('package');
    const { existPackage, price } = await PackageService.getPackage(attr);
    const services = await ServiceService.getServiceInPackage(existPackage.id);
    console.log(services);

    const serviceEmbedded: ServiceEmbedded[] = [];
    services.map((srv) => {
      serviceEmbedded.push({ service: srv, status: false });
    });
    // const services = await Service.find({ _id: { $in: serviceIds } });
    if (orderPackageExist) {
      if (attr.quantity === 0) orderPackageExist.set({ isDeleted: true });
      orderPackageExist.set({ quantity: attr.quantity });
      await orderPackageExist.save();
      return { orderPackage: orderPackageExist, services };
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
    return { orderPackage, services };
  }
  static async newOrderPacakages(order: OrderDoc, packageAttrs: Attrs[]) {
    const orderPackages: OrderPackageDoc[] = [];
    const packagesInOrder: PackageInOrder[] = [];
    let packageTotalPrice: number = 0;
    for (const attr of packageAttrs) {
      const { orderPackage, services } = await this.newOrderPacakage(
        order,
        attr
      );
      if (orderPackage.isDeleted === true) continue;
      packageTotalPrice += orderPackage.totalPrice;
      packagesInOrder.push({
        packageInfor: orderPackage.package,
        services: services,
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
    for (const op of orderPkgs) {
      op.serviceEmbedded.map((srv) => {
        servicesInPackage.push({
          serviceId: srv.service.id,
          name: srv.service.name,
          imageUrl: srv.service.imageUrl,
          // salePrice: srv.service,
          status: srv.status,
        });
      });
      packages.push({
        packageId: op.package.id,
        name: op.package.name,
        imageUrl: op.package.imageUrl,
        salePrice: op.package.salePrice,
        services: servicesInPackage,
        quantity: op.quantity,
      });
    }
    return packages;
  }
  // static async findByOrderId(orderId: string){
  //   // const order =await Order.findOne({_id: orderId, isDeleted: false});
  //   const orderPackages = await OrderPackage.find({order: orderId, isDeleted: false}).populate('package');
  //   const packages: PackageDoc[] = [];
  //   for (const orderPkg of orderPackages) {
  //     packages.push
  //   }
  // }
}
