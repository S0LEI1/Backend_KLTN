import { PackageServiceCreatedPublisher } from '../events/publishers/package-service-event/package-service-created-publisher';
import { PackageServiceDeletedPublisher } from '../events/publishers/package-service-event/package-service-deleted-publisher';
import { PackageServiceUpdatePublisher } from '../events/publishers/package-service-event/package-service-update-publisher';
import { PackageServiceDoc } from '../models/package-service';
import { natsWrapper } from '../nats-wrapper';

export class PackageServicePublisher {
  static async newPackageService(packageService: PackageServiceDoc) {
    new PackageServiceCreatedPublisher(natsWrapper.client).publish({
      id: packageService.id,
      serviceId: packageService.service.id,
      packageId: packageService.package.id,
      quantity: packageService.quantity,
    });
  }
  static async newPackageServices(packageServices: PackageServiceDoc[]) {
    for (const packageService of packageServices) {
      await packageService.save();
      new PackageServiceCreatedPublisher(natsWrapper.client).publish({
        id: packageService.id,
        serviceId: packageService.service.id,
        packageId: packageService.package.id,
        quantity: packageService.quantity,
      });
    }
  }
  static async deletePackageService(packageService: PackageServiceDoc) {
    new PackageServiceDeletedPublisher(natsWrapper.client).publish({
      id: packageService.id,
      version: packageService.version,
      isDeleted: packageService.isDeleted,
    });
  }
  static async updatePackageService(packageServiceDoc: PackageServiceDoc) {
    new PackageServiceUpdatePublisher(natsWrapper.client).publish({
      id: packageServiceDoc.id,
      serviceId: packageServiceDoc.service.id,
      packageId: packageServiceDoc.package.id,
      quantity: packageServiceDoc.package.id.quantity,
      version: packageServiceDoc.version,
    });
  }
}
