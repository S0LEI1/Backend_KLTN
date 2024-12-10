import {
  BadRequestError,
  NotFoundError,
  calcPrice,
} from '@share-package/common';
import { Appointment, AppointmentDoc } from '../models/appointment';
import { Package } from '../models/package';
import { AppointmentPackage } from '../models/appointment-package';

import _ from 'lodash';
import { OrderPackage } from '../models/order-package';
import { ServiceInAppointment } from './appointment-service.service';
import { ServiceDoc } from '../models/service';
export interface PackageAttr {
  packageId: string;
  // execEmp?: string[]
  serviceIds?: string[];
  quantity: number;
}

export interface PackageInAppointment {
  packageId: string;
  services?: ServiceInAppointment[];
  name: string;
  salePrice: number;
  imageUrl: string;
  quantity: number;
  totalPrice: number;
  // execEmp: UserDoc[];
}

export class AppointmentPackageService {
  static async newAppointmentPackage(
    appointmentDoc: AppointmentDoc,
    packageAttr: PackageAttr,
    orderId: string | null
  ) {
    const existPackage = await Package.findPackage(packageAttr.packageId);
    if (!existPackage) throw new NotFoundError('Package not found');
    const existAPackage = await AppointmentPackage.findOne({
      appointment: appointmentDoc.id,
      package: existPackage.id,
      isDeleted: false,
    });
    if (existAPackage)
      throw new BadRequestError('Package existing in appointment');
    const totalPrice = calcPrice(
      existPackage.salePrice,
      packageAttr.quantity,
      existPackage.discount!
    );
    const aPackage = AppointmentPackage.build({
      appointment: appointmentDoc,
      package: existPackage,
      quantity: packageAttr.quantity,
      totalPrice: totalPrice,
    });
    if (orderId && packageAttr.serviceIds) {
      const oPackage = await OrderPackage.findOne({
        order: orderId,
        package: packageAttr.packageId,
        isDeleted: false,
      })
        .populate('package')
        .populate({ path: 'serviceEmbedded.service' });
      if (!oPackage) throw new NotFoundError('Oder-Package');
      const { serviceEmbedded } = oPackage;
      const services: ServiceDoc[] = [];
      const serviceInAppointment: ServiceInAppointment[] = [];
      for (const serviceId of packageAttr.serviceIds) {
        const serviceEmb = serviceEmbedded.find(
          (srv) => srv.service.id === serviceId
        );
        if (!serviceEmb)
          throw new BadRequestError(
            `Package not contain service: ${serviceId}`
          );
        const { quantity, usageLogs } = serviceEmb;
        if (usageLogs!.length >= quantity)
          throw new BadRequestError('Number of Uses Exhausted.');
        if (packageAttr.quantity > oPackage.quantity)
          throw new BadRequestError(
            'Service quantity in appoinment cannot greater quantity in order'
          );
        services.push(serviceEmb.service);
        const totalPrice = calcPrice(
          serviceEmb.service.salePrice,
          packageAttr.quantity,
          serviceEmb.service.discount
        );
        serviceInAppointment.push({
          serviceId: serviceEmb.service.id,
          name: serviceEmb.service.name,
          salePrice: serviceEmb.service.salePrice,
          imageUrl: serviceEmb.service.imageUrl,
          quantity: packageAttr.quantity,
          totalPrice: totalPrice,
        });
      }
      aPackage.set({ servicesEmbedded: services });
      await aPackage.save();
      return { aPackage, existPackage, serviceInAppointment };
    }

    await aPackage.save();
    return { aPackage, existPackage };
  }
  static async newAppointmentPackages(
    appointment: AppointmentDoc,
    packageAttrs: PackageAttr[],
    orderId: string | null
  ) {
    // const appointmentDoc = await Appointment.findAppointment(appointmentId);
    // if (!appointmentDoc) throw new NotFoundError('Appointment');
    const packages: PackageInAppointment[] = [];
    let totalPackagePrice = 0;
    for (const packageAttr of packageAttrs) {
      const { aPackage, existPackage, serviceInAppointment } =
        await this.newAppointmentPackage(appointment, packageAttr, orderId);
      packages.push({
        packageId: existPackage.id,
        name: existPackage.name,
        salePrice: existPackage.salePrice,
        imageUrl: existPackage.imageUrl,
        quantity: aPackage.quantity,
        totalPrice: aPackage.totalPrice,
        services: serviceInAppointment,
      });
      totalPackagePrice += aPackage.totalPrice;
    }
    return { packages, totalPackagePrice };
  }
  static async getAppointmentPackage(appointmentId: string) {
    const appointment = await Appointment.findAppointment(appointmentId);
    if (!appointment) throw new NotFoundError('Appointment');
    const aPackages = await AppointmentPackage.find({
      appointment: appointment.id,
      isDeleted: false,
    })
      .populate('package')
      .populate('servicesEmbedded');
    // .populate({ path: 'execEmp', select: 'id fullName avatar gender' });
    const packages: PackageInAppointment[] = [];
    let totalPackagePrice = 0;
    for (const as of aPackages) {
      const servicesInAppointment: ServiceInAppointment[] = [];
      const { servicesEmbedded } = as;
      if (servicesEmbedded) {
        for (const service of servicesEmbedded!) {
          servicesInAppointment.push({
            serviceId: service.id,
            name: service.name,
            salePrice: service.salePrice,
            imageUrl: service.imageUrl,
            quantity: 0,
            totalPrice: 0,
          });
        }
      }
      packages.push({
        packageId: as.package.id,
        name: as.package.name,
        salePrice: as.package.salePrice,
        imageUrl: as.package.imageUrl,
        quantity: as.quantity,
        totalPrice: as.totalPrice,
        services: [],
      });
      totalPackagePrice += as.totalPrice;
    }

    return { packages, totalPackagePrice };
  }
  static async deleteAppointmentPackage(
    appointmentDoc: AppointmentDoc,
    packageAttr: PackageAttr
  ) {
    const aPackage = await AppointmentPackage.findOne({
      appointment: appointmentDoc.id,
      package: packageAttr.packageId,
      isDeleted: false,
    });
    if (!aPackage) throw new NotFoundError('Appointment-Service');
    aPackage.set({ isDeleted: true });
    await aPackage.save();
    return aPackage.totalPrice;
  }
  static async deleteAppointmentServices(
    appointmentDoc: AppointmentDoc,
    packageAttrs: PackageAttr[]
  ) {
    let deletePrice = 0;
    for (const packageAttr of packageAttrs) {
      const price = await this.deleteAppointmentPackage(
        appointmentDoc,
        packageAttr
      );
      deletePrice += price;
    }
    return deletePrice;
  }
  static async updateAppointmentPackage(
    appointmentDoc: AppointmentDoc,
    packageAttr: PackageAttr
  ) {
    const aPackage = await AppointmentPackage.findOne({
      appointment: appointmentDoc.id,
      package: packageAttr.packageId,
      isDeleted: false,
    })
      .populate('package')
      .populate('appointment');
    if (!aPackage) throw new NotFoundError('Appointment-Package');
    if (aPackage.quantity === packageAttr.quantity) return aPackage;
    const totalPrice = calcPrice(
      aPackage.package.salePrice,
      packageAttr.quantity,
      aPackage.package.discount!
    );
    aPackage.set({
      quantity: packageAttr.quantity,
      totalPrice: totalPrice,
    });
    await aPackage.save();
    return aPackage;
  }
  static async updateAppointmentServices(
    appointmentId: string,
    packageAttrs: PackageAttr[]
  ) {
    const appointmentDoc = await Appointment.findAppointment(appointmentId);
    if (!appointmentDoc) throw new NotFoundError('Appointment');
    const { packages, totalPackagePrice } = await this.getAppointmentPackage(
      appointmentDoc.id
    );
    const existPackageAttrs: PackageAttr[] = [];
    for (const pkg of packages) {
      // const execEmpId: string[] = srv.execEmp.map((exec) => exec.id);
      const packageAttr: PackageAttr = {
        packageId: pkg.packageId,
        quantity: pkg.quantity,
        // execEmp: execEmpId,
      };
      existPackageAttrs.push(packageAttr);
    }
    const deleteValue = _.differenceBy(
      existPackageAttrs,
      packageAttrs,
      'packageId'
    );
    const updateValue = _.intersectionBy(
      packageAttrs,
      existPackageAttrs,
      'packageId'
    );
    const addValue = _.differenceBy(
      packageAttrs,
      existPackageAttrs,
      'packageId'
    );
    const addPackages = await this.newAppointmentPackages(
      appointmentDoc,
      addValue,
      null
    );
    console.log('addPackage', addValue);
    console.log('updatePackage', updateValue);
    console.log('deletePackage', deleteValue);
    let totalPrice = 0;
    const updatePackage: PackageInAppointment[] = [];
    for (const value of updateValue) {
      const aPackage = await this.updateAppointmentPackage(
        appointmentDoc,
        value
      );
      updatePackage.push({
        packageId: aPackage.package.id,
        name: aPackage.package.name,
        salePrice: aPackage.package.salePrice,
        imageUrl: aPackage.package.imageUrl,
        quantity: aPackage.quantity,
        totalPrice: aPackage.totalPrice,
        services: [],
      });
      totalPrice += aPackage.totalPrice;
    }
    const deletePrice = await this.deleteAppointmentServices(
      appointmentDoc,
      deleteValue
    );
    const packageInAppointment: PackageInAppointment[] = [];
    packageInAppointment.push(...addPackages.packages);
    packageInAppointment.push(...updatePackage);
    totalPrice += addPackages.totalPackagePrice;
    return { packageInAppointment, totalPrice };
  }
}
