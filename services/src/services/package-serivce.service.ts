import { BadRequestError, NotFoundError } from '@share-package/common';
import { Service, ServiceDoc } from '../models/service';
import { Package, PackageDoc } from '../models/package';
import { PackageService, PackageServiceDoc } from '../models/package-service';
import { PackageServicePublisher } from './package-service.publisher.service';
import exceljs from 'exceljs';
// import { ServiceAttr } from './packages.service';
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
    return {
      packageService: newPS,
      service: service.service,
      quantity: newPS.quantity,
    };
  }
  static async newPackageServices(
    serviceAttrs: ServiceAttrs[],
    packageDoc: PackageDoc
  ) {
    const servicesInPackage: ServiceInPackage[] = [];
    const packageServices: PackageServiceDoc[] = [];
    for (const serviceAttr of serviceAttrs) {
      const serviceExist = await Service.findOne({
        _id: serviceAttr.id,
        isDeleted: false,
      });
      if (!serviceExist) throw new NotFoundError('Service' + serviceAttr.id);
      const packageServiceExist = await this.findPackageService(
        serviceExist.id,
        packageDoc.id
      );
      if (packageServiceExist)
        throw new BadRequestError('Package-Service exist');
      const { packageService, service, quantity } =
        await this.newPackageService(
          { service: serviceExist, quantity: serviceAttr.quantity },
          packageDoc
        );
      if (packageService.isDeleted === true) continue;
      servicesInPackage.push({
        service: service,
        quantity: quantity,
      });
      packageServices.push(packageService);
    }
    // publish create event
    return { packageDoc, servicesInPackage, packageServices };
  }
  static async deletePackageSevice(
    serviceAttr: ServiceAttrs,
    packageDoc: PackageDoc
  ) {
    const existPS = await PackageService.findOne({
      package: packageDoc.id,
      service: serviceAttr.id,
      isDeleted: false,
    });
    if (!existPS) throw new BadRequestError('Package Service do not exist');
    // publish deleted event
    existPS.set({ isDeleted: true, quantity: 0 });
    await existPS.save();
    return existPS;
  }
  static async deletePackageServices(
    serviceAttrs: ServiceAttrs[],
    packageDoc: PackageDoc
  ) {
    for (const serviceAttr of serviceAttrs) {
      await this.deletePackageSevice(serviceAttr, packageDoc);
    }
  }
  static async updatePackageSevice(
    serviceAttr: ServiceAttrs,
    packageDoc: PackageDoc
  ) {
    const existService = await Service.findOne({
      _id: serviceAttr.id,
      isDeleted: false,
    });
    if (!existService) throw new NotFoundError('Service not found');
    const existPS = await PackageService.findOne({
      package: packageDoc.id,
      service: existService.id,
      isDeleted: false,
    });
    if (!existPS) throw new BadRequestError('Package Service do not exist');
    // publish deleted event
    existPS.set({ quantity: serviceAttr.quantity });
    await existPS.save();
    PackageServicePublisher.updatePackageService(existPS);
    return { service: existService, quantity: existPS.quantity };
  }
  static async updatePackageSevices(
    servicesInPackage: ServiceAttrs[],
    packageDoc: PackageDoc
  ) {
    const services: ServiceInPackage[] = [];
    for (const serviceInPackage of servicesInPackage) {
      const { service, quantity } = await this.updatePackageSevice(
        serviceInPackage,
        packageDoc
      );
      services.push({
        service: service,
        quantity: quantity,
      });
    }
    return services;
  }
  static async findServiceInPackageId(id: string) {
    const packageSrvs = await PackageService.find({
      package: id,
      isDeleted: false,
    })
      .populate('service')
      .populate('package');
    const services: ServiceDoc[] = packageSrvs.map((ps) => ps.service);
    const serviceAttr: ServiceAttrs[] = [];
    packageSrvs.map((ps) => {
      serviceAttr.push({
        id: ps.service.id,
        quantity: ps.quantity,
      });
    });
    return { services, serviceAttr };
  }

  static async findPackageService(serviceId: string, packageId: string) {
    const packageSrvExist = await PackageService.findOne({
      package: packageId,
      service: serviceId,
      isDeleted: false,
    })
      .populate({ path: 'service', match: { isDeleted: false } })
      .populate('package');
    return packageSrvExist;
  }
}
