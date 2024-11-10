import { ObjectId } from 'mongoose';
import { OrderDoc } from '../models/order';
import { OrderPackage, OrderPackageDoc } from '../models/order-package';
import { Attrs } from './order.service';
import { PackageService } from './package.service';
import { ServiceService } from './service.service';
import { Package, PackageDoc } from '../models/package';
import { NotFoundError } from '@share-package/common';

export class OrderPackageService {
  static async newOrderPacakage(order: OrderDoc, packageAttrs: Attrs[]) {
    const orderPackages: OrderPackageDoc[] = [];
    let packageTotalPrice: number = 0;
    for (const attr of packageAttrs) {
      const { existPackage, price } = await PackageService.getPackage(attr);
      const services = await ServiceService.getServiceInPackage(
        existPackage.id
      );
      const orderPackage = OrderPackage.build({
        order: order,
        package: existPackage,
        services: services,
        quantity: attr.quantity,
        totalPrice: price,
      });
      await orderPackage.save();
      packageTotalPrice += price;
    }
    return { orderPackages, packageTotalPrice };
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
}
