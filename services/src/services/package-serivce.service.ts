import { BadRequestError, NotFoundError } from '@share-package/common';
import { Service, ServiceDoc } from '../models/service';
import { Package, PackageDoc } from '../models/package';
import { PackageService, PackageServiceDoc } from '../models/package-service';
import { PackageServicePublisher } from './package-service.publisher.service';
import exceljs from 'exceljs';
export interface ServiceInPackage {
  service: ServiceDoc;
  quantity: number;
}
export interface ServiceAttrs {
  id: string;
  quantity: number;
}
export class PackageServiceServices {
  static async newPackageService(
    service: ServiceInPackage,
    packageDoc: PackageDoc
  ) {
    const newPS = PackageService.build({
      service: service.service,
      package: packageDoc,
      quantity: service.quantity,
    });
    await newPS.save();
    PackageServicePublisher.newPackageService(newPS);
    return {
      packageService: newPS,
      service: service.service,
      quantity: newPS.quantity,
    };
  }
  static async newPackageServices(
    serviceAttrs: ServiceAttrs[],
    packageId: string
  ) {
    const packageExist = await Package.findPackage(packageId);
    if (!packageExist) throw new NotFoundError('Package');
    const servicesInPackage: ServiceInPackage[] = [];
    for (const serviceAttr of serviceAttrs) {
      console.log(serviceAttr);

      const serviceExist = await Service.findOne({
        _id: serviceAttr.id,
        isDeleted: false,
      });
      if (!serviceExist) throw new NotFoundError('Service');
      const packageServiceExist = await this.findPackageService(
        serviceExist.id,
        packageExist.id
      );
      if (packageServiceExist)
        throw new BadRequestError('Package-Service exist');
      const { packageService, service, quantity } =
        await this.newPackageService(
          { service: serviceExist, quantity: serviceAttr.quantity },
          packageExist
        );
      if (packageService.isDeleted === true) continue;
      servicesInPackage.push({
        service: service,
        quantity: quantity,
      });
    }
    // publish create event
    return { packageExist, servicesInPackage };
  }
  static async deletePackageSevice(
    serviceInPackage: ServiceInPackage,
    packageDoc: PackageDoc
  ) {
    const existPS = await PackageService.findOne({
      package: packageDoc.id,
      service: serviceInPackage.service.id,
      isDeleted: false,
    });
    if (!existPS) throw new BadRequestError('Package Service do not exist');
    // publish deleted event
    existPS.set({ isDeleted: false, quantity: 0 });
    await existPS.save();
    return existPS;
  }
  static async updatePackageSevice(
    serviceInPackage: ServiceInPackage,
    packageDoc: PackageDoc
  ) {
    const existPS = await PackageService.findOne({
      package: packageDoc.id,
      service: serviceInPackage.service.id,
      isDeleted: false,
    });
    if (!existPS) throw new BadRequestError('Package Service do not exist');
    // publish deleted event
    existPS.set({ quantity: serviceInPackage.quantity });
    await existPS.save();
    return existPS;
  }
  static async findServiceInPackageId(id: string) {
    const packageSrvs = await PackageService.find({
      package: id,
      isDeleted: false,
    })
      .populate('service')
      .populate('package');
    const services: ServiceDoc[] = packageSrvs.map((ps) => ps.service);
    return services;
  }
  static async findPackageService(serviceId: string, packageId: string) {
    const packageSrvExist = await PackageService.findOne({
      package: packageId,
      service: serviceId,
      isDeleted: false,
    })
      .populate('service')
      .populate('package');
    return packageSrvExist;
  }
}
