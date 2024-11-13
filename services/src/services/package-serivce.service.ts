import { BadRequestError, NotFoundError } from '@share-package/common';
import { Service, ServiceDoc } from '../models/service';
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
      isDeleted: false,
    });
    if (existPSs.length > 0)
      throw new BadRequestError('Package Service is exist');
    const packageServices: PackageServiceDoc[] = [];
    const serviceList: ServiceDoc[] = [];
    for (const service of services) {
      const newPS = PackageService.build({
        service: service,
        package: existPackage,
      });
      await newPS.save();
      PackageServicePublisher.newPackageService(newPS);
      packageServices.push(newPS);
      console.log('add service successfully');
    }
    // publish create event
    return { packageServices, services };
  }
  static async deletePackageSevice(attrs: {
    serviceIds: string[];
    packageId: string;
  }) {
    try {
      const existPSs = await PackageService.find({
        package: attrs.packageId,
        service: { $in: attrs.serviceIds },
        isDeleted: false,
      });
      if (existPSs.length <= 0)
        throw new BadRequestError('Package Service do not exist');
      // publish deleted event
      for (const ps of existPSs) {
        PackageServicePublisher.deletePackageService(ps);
        ps.set({ isDeleted: true });
        await ps.save();
        console.log('delete service successfully');
      }
    } catch (error) {
      console.log(error);
    }
  }
  static async findServiceInPackageId(id: string) {
    const packageSrvs = await PackageService.find({
      package: id,
      isDeleted: false,
    }).populate('service');
    const services: ServiceDoc[] = packageSrvs.map((ps) => ps.service);
    return services;
  }
}
