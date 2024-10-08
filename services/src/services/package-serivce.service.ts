import { BadRequestError, NotFoundError } from '@share-package/common';
import { Service } from '../models/service';
import { Package } from '../models/package';
import { PackageService } from '../models/package-service';
import { PackageServicePublisher } from './package-service.publisher.service';

export class PackageServiceServices {
  static async newPackageService(serviceId: string, packageId: string) {
    const service = await Service.findService(serviceId);
    if (!service) throw new NotFoundError('Service');
    const existPackage = await Package.findPackage(packageId);
    if (!existPackage) throw new NotFoundError('Package');
    const existPS = await PackageService.findByServiceAndPackage(
      serviceId,
      packageId
    );
    if (existPS) throw new BadRequestError('Package Service is exist');
    const newPS = PackageService.build({
      service: service,
      package: existPackage,
    });
    await newPS.save();
    // publish create event
    PackageServicePublisher.newPackageService(newPS);
    return newPS;
  }
  static async deletePackageSevice(id: string) {
    try {
      const existPS = await PackageService.findPackageService(id);
      if (!existPS) throw new BadRequestError('Package Service do not exist');
      // publish deleted event
      PackageServicePublisher.deletePackageService(existPS);
      await PackageService.deleteOne({ _id: existPS.id });
    } catch (error) {
      console.log(error);
    }
  }
}
