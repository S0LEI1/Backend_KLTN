import { AppointmentStatus } from '@share-package/common';
import { ServiceInAppointment } from '../services/appointment-service.service';
import { PackageInAppointment } from '../services/appointment-package.service';
import { AppointmentDoc } from '../models/appointment';

export interface AppointmentConvert {
  id: string;
  customerId: string;
  customerName: string;
  customerImageUrl: string;
  customerPhoneNumber: string;
  creatorId: string;
  creatorName: string;
  creatorImageUrl: string;
  consultantId?: string;
  consultantName?: string;
  consultantImageUrl?: string;
  branchId: string;
  branchName: string;
  dateTime: Date;
  status: AppointmentStatus;
  description: string;
  totalPrice?: number;
  services?: ServiceInAppointment[];
  packages?: PackageInAppointment[];
}

export class Convert {
  static appointment(
    appointment: AppointmentDoc,
    services: ServiceInAppointment[],
    packages: PackageInAppointment[]
  ) {
    const apmConvert: AppointmentConvert = {
      id: appointment.id,
      customerId: appointment.customer.id,
      customerName: appointment.customer.fullName,
      customerImageUrl: appointment.customer.avatar!,
      customerPhoneNumber: appointment.customer.phoneNumber,
      creatorId: appointment.creator.id,
      creatorName: appointment.creator.fullName,
      creatorImageUrl: appointment.creator.avatar!,
      consultantId: appointment.consultant?.id,
      consultantName: appointment.consultant?.fullName,
      consultantImageUrl: appointment.consultant?.avatar!,
      branchId: appointment.branch.id,
      branchName: appointment.branch.name,
      dateTime: appointment.dateTime,
      status: appointment.status,
      description: appointment.description,
      services: services,
      packages: packages,
    };
    return apmConvert;
  }
  static appointments(
    appointments: {
      appointment: AppointmentDoc;
      services: ServiceInAppointment[];
      packages: PackageInAppointment[];
    }[]
  ) {
    const apmConverts: AppointmentConvert[] = [];
    for (const app of appointments) {
      const apmConvert = this.appointment(
        app.appointment,
        app.services,
        app.packages
      );
      apmConverts.push(apmConvert);
    }
    return apmConverts;
  }
}
