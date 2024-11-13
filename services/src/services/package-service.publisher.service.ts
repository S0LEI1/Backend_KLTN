import { PackageServiceCreatedPublisher } from '../events/publishers/package-service-event/package-service-created-publisher';
import { PackageServiceDeletedPublisher } from '../events/publishers/package-service-event/package-service-deleted-publisher';
import { PackageServiceDoc } from '../models/package-service';
import { natsWrapper } from '../nats-wrapper';

export class PackageServicePublisher {
  static async newPackageService(packageService: PackageServiceDoc) {
    new PackageServiceCreatedPublisher(natsWrapper.client).publish({
      id: packageService.id,
      serviceId: packageService.service.id,
      packageId: packageService.package.id,
    });
  }
  static async deletePackageService(packageService: PackageServiceDoc) {
    new PackageServiceDeletedPublisher(natsWrapper.client).publish({
      id: packageService.id,
      version: packageService.version,
      isDeleted: packageService.isDeleted,
    });
  }
}
