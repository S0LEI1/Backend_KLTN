import {
  BadRequestError,
  NotFoundError,
  UserType,
  calcPrice,
} from '@share-package/common';
import { Appointment, AppointmentDoc } from '../models/appointment';
import { Package } from '../models/package';
import { AppointmentPackage } from '../models/appointment-package';
import { User, UserDoc } from '../models/user';
import { forEachChild } from 'typescript';
import _ from 'lodash';
export interface PackageAttr {
  packageId: string;
  // execEmp?: string[];
  quantity: number;
}

export interface PackageInAppointment {
  packageId: string;
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
    packageAttr: PackageAttr
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
    let employeesInAppointment: UserDoc[] = [];
    // if (packageAttr.execEmp) {
    //   employeesInAppointment = await User.find(
    //     {
    //       _id: { $in: packageAttr.execEmp },
    //       type: UserType.Employee,
    //       isDeleted: false,
    //     },
    //     { id: 1, fullName: 1, gender: 1, avatar: 1 }
    //   );

    //   aPackage.set({ execEmp: employeesInAppointment });
    // }
    await aPackage.save();
    return { aPackage, existPackage, employeesInAppointment };
  }
  static async newAppointmentPackages(
    appointmentId: string,
    packageAttrs: PackageAttr[]
  ) {
    const appointmentDoc = await Appointment.findAppointment(appointmentId);
    if (!appointmentDoc) throw new NotFoundError('Appointment');
    const packages: PackageInAppointment[] = [];
    let totalPackagePrice = 0;
    for (const packageAttr of packageAttrs) {
      const { aPackage, existPackage, employeesInAppointment } =
        await this.newAppointmentPackage(appointmentDoc, packageAttr);
      packages.push({
        packageId: existPackage.id,
        name: existPackage.name,
        salePrice: existPackage.salePrice,
        imageUrl: existPackage.imageUrl,
        quantity: aPackage.quantity,
        totalPrice: aPackage.totalPrice,
        // execEmp: employeesInAppointment,
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
    }).populate('package');
    // .populate({ path: 'execEmp', select: 'id fullName avatar gender' });
    const packages: PackageInAppointment[] = [];
    let totalPackagePrice = 0;
    for (const as of aPackages) {
      packages.push({
        packageId: as.package.id,
        name: as.package.name,
        salePrice: as.package.salePrice,
        imageUrl: as.package.imageUrl,
        quantity: as.quantity,
        totalPrice: as.totalPrice,
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
      appointmentId,
      addValue
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
