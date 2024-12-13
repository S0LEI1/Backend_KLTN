import { OrderPackageCreatedPublisher } from '../events/publisher/order-package/order-package-created-publisher';
import { OrderPackageDeletedPublisher } from '../events/publisher/order-package/order-package-deleted-publisher';
import { OrderPackageUpdatedPublisher } from '../events/publisher/order-package/order-package-updated-publisher';
import { OrderPackageDoc } from '../models/order-package';
import { natsWrapper } from '../nats-wrapper';
interface UsageLog {
  date: Date;
  status: boolean;
}
interface ServiceEmbedded {
  service: string;
  status: boolean;
  quantity: number;
  usageLogs?: UsageLog[];
}
export class OrderPackagePublisher {
  static async newOrderPackage(orderPackageDoc: OrderPackageDoc) {
    const serviceEmbeddeds: ServiceEmbedded[] = [];
    for (const serviceEmbedded of orderPackageDoc.serviceEmbedded) {
      serviceEmbeddeds.push({
        service: serviceEmbedded.service.id,
        status: serviceEmbedded.status,
        quantity: serviceEmbedded.quantity,
      });
    }
    new OrderPackageCreatedPublisher(natsWrapper.client).publish({
      id: orderPackageDoc.id,
      order: orderPackageDoc.order.id,
      package: orderPackageDoc.package.id,
      serviceEmbedded: serviceEmbeddeds,
      quantity: orderPackageDoc.quantity,
      totalPrice: orderPackageDoc.totalPrice,
    });
  }
  static async newOrderPackages(orderPackageDocs: OrderPackageDoc[]) {
    for (const op of orderPackageDocs) {
      this.newOrderPackage(op);
    }
  }
  static async updateOrderPackage(orderPackageDoc: OrderPackageDoc) {
    const serviceEmbeddeds: ServiceEmbedded[] = [];
    for (const serviceEmbedded of orderPackageDoc.serviceEmbedded) {
      serviceEmbeddeds.push({
        service: serviceEmbedded.service.id,
        status: serviceEmbedded.status,
        quantity: serviceEmbedded.quantity,
      });
    }
    new OrderPackageUpdatedPublisher(natsWrapper.client).publish({
      id: orderPackageDoc.id,
      order: orderPackageDoc.order.id,
      package: orderPackageDoc.package.id,
      serviceEmbedded: serviceEmbeddeds,
      quantity: orderPackageDoc.quantity,
      totalPrice: orderPackageDoc.totalPrice,
      version: orderPackageDoc.version,
    });
  }
  static async deletedOrderPackage(orderPackageDoc: OrderPackageDoc) {
    new OrderPackageDeletedPublisher(natsWrapper.client).publish({
      id: orderPackageDoc.id,
      version: orderPackageDoc.version,
    });
  }
}
