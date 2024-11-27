import {
  BadRequestError,
  NotFoundError,
  UserType,
} from '@share-package/common';
import { Appointment, AppointmentDoc } from '../models/appointment';
import { Package } from '../models/package';
import { AppointmentPackage } from '../models/appointment-package';
import { User, UserDoc } from '../models/user';
import { forEachChild } from 'typescript';
interface PackageAttr {
  id: string;
  execEmp?: string[];
  quantity: number;
}

export interface PackageInAppointment {
  packageId: string;
  name: string;
  salePrice: number;
  imageUrl: string;
  quantity: number;
  execEmp: UserDoc[];
}

export class AppointmentPackageService {
  static async newAppointmentPackage(
    appointmentDoc: AppointmentDoc,
    packageAttr: PackageAttr
  ) {
    const existPackage = await Package.findPackage(packageAttr.id);
    if (!existPackage) throw new NotFoundError('Package not found');
    const existAPackage = await AppointmentPackage.findOne({
      appointment: appointmentDoc.id,
      package: existPackage.id,
    });
    if (existAPackage)
      throw new BadRequestError('Package existing in appointment');
    const aPackage = AppointmentPackage.build({
      appointment: appointmentDoc,
      package: existPackage,
      quantity: packageAttr.quantity,
    });
    let employeesInAppointment: UserDoc[] = [];
    if (packageAttr.execEmp) {
      employeesInAppointment = await User.find(
        {
          _id: { $in: packageAttr.execEmp },
          type: UserType.Employee,
          isDeleted: false,
        },
        { id: 1, fullName: 1, gender: 1, avatar: 1 }
      );

      aPackage.set({ execEmp: employeesInAppointment });
    }
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
    for (const packageAttr of packageAttrs) {
      const { aPackage, existPackage, employeesInAppointment } =
        await this.newAppointmentPackage(appointmentDoc, packageAttr);
      packages.push({
        packageId: existPackage.id,
        name: existPackage.name,
        salePrice: existPackage.salePrice,
        imageUrl: existPackage.imageUrl,
        quantity: aPackage.quantity,
        execEmp: employeesInAppointment,
      });
    }
    return packages;
  }
  static async getAppointmentPackage(appointmentId: string) {
    const appointment = await Appointment.findAppointment(appointmentId);
    if (!appointment) throw new NotFoundError('Appointment');
    const aPackages = await AppointmentPackage.find({
      appointment: appointment.id,
    })
      .populate('package')
      .populate({ path: 'execEmp', select: 'id fullName avatar gender' });
    const packages: PackageInAppointment[] = [];
    for (const as of aPackages) {
      packages.push({
        packageId: as.package.id,
        name: as.package.name,
        salePrice: as.package.salePrice,
        imageUrl: as.package.imageUrl,
        quantity: as.quantity,
        execEmp: as.execEmp,
      });
    }
    return packages;
  }
}
