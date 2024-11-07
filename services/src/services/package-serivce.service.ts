import { BadRequestError, NotFoundError } from '@share-package/common';
import { Service } from '../models/service';
import { Package } from '../models/package';
import { PackageService, PackageServiceDoc } from '../models/package-service';
import { PackageServicePublisher } from './package-service.publisher.service';
import exceljs from 'exceljs';

export class PackageServiceServices {
  static async newPackageService(serviceIds: string[], packageId: string) {
    const services = await Service.find({
      _id: { $in: serviceIds },
      isDeleted: false,
    });
    if (!services) throw new NotFoundError('Services');
    const existPackage = await Package.findPackage(packageId);
    if (!existPackage) throw new NotFoundError('Package');
    const existPSs = await PackageService.find({
      service: { $in: serviceIds },
      package: packageId,
    });
    if (existPSs.length > 0)
      throw new BadRequestError('Package Service is exist');
    const packageServices: PackageServiceDoc[] = [];
    for (const service of services) {
      const newPS = PackageService.build({
        service: service,
        package: existPackage,
      });
      await newPS.save();
      PackageServicePublisher.newPackageService(newPS);
      packageServices.push(newPS);
    }
    // publish create event
    return packageServices;
  }
  static async deletePackageSevice(attrs: {
    serviceIds: string[];
    packageId: string;
  }) {
    try {
      const existPSs = await PackageService.find({
        package: attrs.packageId,
        service: { $in: attrs.serviceIds },
      });
      if (existPSs.length <= 0)
        throw new BadRequestError('Package Service do not exist');
      // publish deleted event
      for (const ps of existPSs) {
        PackageServicePublisher.deletePackageService(ps);
        await PackageService.deleteOne({ _id: ps.id });
      }
    } catch (error) {
      console.log(error);
    }
  }
}
