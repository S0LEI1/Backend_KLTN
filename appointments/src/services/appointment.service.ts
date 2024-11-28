import {
  AppointmentStatus,
  BadRequestError,
  NotFoundError,
  Pagination,
  UserType,
} from '@share-package/common';
import { Appointment, AppointmentDoc } from '../models/appointment';

import { User } from '../models/user';
import { Branch } from '../models/branch';
import {
  AppointmentServiceServices,
  ServiceInAppointment,
} from './appointment-service.service';
import {
  AppointmentPackageService,
  PackageInAppointment,
} from './appointment-package.service';
import { format } from 'date-fns';
import { AppointmentService } from '../models/appointment-service';
import { AppointmentPackage } from '../models/appointment-package';
const PER_PAGE = process.env.PER_PAGE;
interface AppointmentConvert {
  id: string;
  customerId: string;
  customerName: string;
  customerImageUrl: string;
  customerPhoneNumber: string;
  creatorId: string;
  creatorName: string;
  creatorImageUrl: string;
  branchId: string;
  branchName: string;
  dateTime: Date;
  status: AppointmentStatus;
  description: string;
  services?: ServiceInAppointment[];
  packages?: PackageInAppointment[];
}
export class AppointmentServices {
  static async newAppointment(
    creatorId: string,
    customerId: string,
    branchId: string,
    dateTime: Date,
    description: string
  ) {
    const creator = await User.findUser(creatorId);
    if (!creator) throw new NotFoundError('Creator not found');
    const customer = await User.findCustomer(customerId);
    if (!customer) throw new NotFoundError('Customer not found');
    const branch = await Branch.findBranch(branchId);
    if (!branch) throw new NotFoundError('Branch not found');
    const nowDateTime = new Date();
    const inputDate = new Date(dateTime);
    // inputDate.setHours(20, 0, 0);
    console.log('inputDate', inputDate);
    console.log('nowDateTime', nowDateTime);

    if (inputDate < nowDateTime)
      throw new BadRequestError(
        'Appointment date must be greater than or equal now date'
      );
    var startHappyHourD = new Date(dateTime);
    startHappyHourD.setHours(8, 30, 0); // 5.30 pm
    var endHappyHourD = new Date(dateTime);
    endHappyHourD.setHours(19, 30, 0);
    console.log(inputDate.getTime());
    console.log(startHappyHourD.getTime());
    console.log(endHappyHourD.getTime());

    if (
      inputDate.getTime() < startHappyHourD.getTime() ||
      inputDate.getTime() > endHappyHourD.getTime()
    )
      throw new BadRequestError('Appointment time between 8.30am and 19.30pm');
    if (inputDate.getTime() <= nowDateTime.getTime() + 1 * 60 * 60 * 1000)
      throw new BadRequestError(
        'Appointment time must be greater than now time least 1hour'
      );
    const existApm = await Appointment.findOne({
      customer: customer.id,
      dateTime: dateTime,
    });
    if (existApm) throw new BadRequestError('Appointment already exists');
    const apm = Appointment.build({
      creator: creator,
      customer: customer,
      branch: branch,
      dateTime: dateTime,
      status: AppointmentStatus.Created,
      description: description,
    });
    await apm.save();
    const apmConvert: AppointmentConvert = {
      id: apm.id,
      customerId: customer.id,
      customerName: customer.fullName,
      customerImageUrl: customer.avatar!,
      customerPhoneNumber: customer.phoneNumber,
      creatorId: creator.id,
      creatorName: creator.fullName,
      creatorImageUrl: creator.avatar!,
      branchId: branch.id,
      branchName: branch.name,
      dateTime: apm.dateTime,
      status: apm.status,
      description: apm.description,
    };
    return apmConvert;
  }
  static async getAppointments(
    userId: string,
    type: string,
    pages: string,
    dateTime: string,
    date: string,
    status: string
  ) {
    const filter = Pagination.query();
    filter.isDeleted = false;
    if (type === UserType.Customer) filter.customer = userId;
    if (dateTime) {
      const dateFormat = format(dateTime, 'yyyy-MM-dd');
      const convertDate = new Date(dateFormat);
      const ltDate = new Date(convertDate);
      ltDate.setDate(ltDate.getDate() + 1);
      filter.dateTime = { $gte: convertDate, $lt: ltDate };
    }
    if (status === AppointmentStatus.Created)
      filter.status = AppointmentStatus.Created;
    if (status === AppointmentStatus.Cancelled)
      filter.status = AppointmentStatus.Cancelled;
    if (status === AppointmentStatus.Complete)
      filter.status = AppointmentStatus.Complete;
    const sort = Pagination.query();
    sort.date = 1;
    if (date === 'asc') sort.dateTime = 1;
    if (date === 'desc') sort.dateTime = -1;
    const options = Pagination.options(pages, PER_PAGE!, sort);

    const appointments = await Appointment.find(filter, {}, options)
      .populate('customer')
      .populate('creator')
      .populate('branch');
    const apmConverts: AppointmentConvert[] = [];
    let services: ServiceInAppointment[] = [];
    let packages: PackageInAppointment[] = [];
    for (const apm of appointments) {
      const aService = await AppointmentService.findByAppointment(apm);
      if (aService) {
        services = await AppointmentServiceServices.getAppointmentServices(
          apm.id
        );
      }
      const aPackage = await AppointmentPackage.findByAppointment(apm);
      if (aPackage) {
        packages = await AppointmentPackageService.getAppointmentPackage(
          apm.id
        );
      }
      // order
      //
      apmConverts.push({
        id: apm.id,
        customerId: apm.customer.id,
        customerName: apm.customer.fullName,
        customerImageUrl: apm.customer.avatar!,
        customerPhoneNumber: apm.customer.phoneNumber,
        creatorId: apm.creator.id,
        creatorName: apm.creator.fullName,
        creatorImageUrl: apm.creator.avatar!,
        branchId: apm.branch.id,
        branchName: apm.branch.name,
        dateTime: apm.dateTime,
        status: apm.status,
        description: apm.description,
        services: services,
        packages: packages,
      });
    }
    return apmConverts;
  }
  static async getAppointment(id: string) {
    const appointment = await Appointment.findAppointment(id);
    if (!appointment) throw new NotFoundError('Appointment');
    const services = await AppointmentServiceServices.getAppointmentServices(
      appointment.id
    );
    const packages = await AppointmentPackageService.getAppointmentPackage(
      appointment.id
    );
    // order
    //
    const apmConvert: AppointmentConvert = {
      id: appointment.id,
      customerId: appointment.customer.id,
      customerName: appointment.customer.fullName,
      customerImageUrl: appointment.customer.avatar!,
      customerPhoneNumber: appointment.customer.phoneNumber,
      creatorId: appointment.creator.id,
      creatorName: appointment.creator.fullName,
      creatorImageUrl: appointment.creator.avatar!,
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
  static async cancelAppointment(
    userId: string,
    type: string,
    appointmentId: string
  ) {
    const appointment = await Appointment.findAppointment(appointmentId);
    if (!appointment) throw new NotFoundError('Appointment');
    if (type === UserType.Customer && userId !== appointment.customer.id) {
      throw new BadRequestError('You are not the owner of the appointment');
    }
    if (appointment.status === AppointmentStatus.Cancelled)
      throw new BadRequestError('Appointment cancelled');
    if (appointment.status === AppointmentStatus.Complete)
      throw new BadRequestError('Cannot cancell appointment completed');
    appointment.set({ status: AppointmentStatus.Cancelled });
    const services = await AppointmentServiceServices.getAppointmentServices(
      appointment.id
    );
    const packages = await AppointmentPackageService.getAppointmentPackage(
      appointment.id
    );
    await appointment.save();
    const apmConvert: AppointmentConvert = {
      id: appointment.id,
      customerId: appointment.customer.id,
      customerName: appointment.customer.fullName,
      customerImageUrl: appointment.customer.avatar!,
      customerPhoneNumber: appointment.customer.phoneNumber,
      creatorId: appointment.creator.id,
      creatorName: appointment.creator.fullName,
      creatorImageUrl: appointment.creator.avatar!,
      branchId: appointment.branch.id,
      branchName: appointment.branch.name,
      dateTime: appointment.dateTime,
      status: appointment.status,
      description: appointment.description,
      services: services,
      packages: packages,
    };
    return apmConvert;
    // return appointment;
  }
  static async deleteAppointment(
    userId: string,
    type: string,
    appointmentId: string
  ) {
    const appointment = await Appointment.findAppointment(appointmentId);
    if (!appointment) throw new NotFoundError('Appointment');
    if (type === UserType.Customer && userId !== appointment.customer.id) {
      throw new BadRequestError('You are not the owner of the appointment');
    }
    // if(appointment.status === AppointmentStatus.Cancelled) throw new BadRequestError('Appointment cancelled');
    // if(appointment.status ===AppointmentStatus.Complete) throw new BadRequestError('Cannot cancell appointment completed');
    // appointment.set({status: AppointmentStatus.Cancelled});
    appointment.set({ isDeleted: true });
    await appointment.save();
    return appointment;
  }
  static async updateAppointment(
    appointmentId: string,
    branchId: string,
    dateTime: Date,
    description: string
  ) {
    const appointment = await Appointment.findAppointment(appointmentId);
    if (!appointment) throw new NotFoundError('Appointment');
    const branch = await Branch.findBranch(branchId);
    if (!branch) throw new NotFoundError('Branch');
    const nowDateTime = new Date();
    const inputDate = new Date(dateTime);
    // inputDate.setHours(20, 0, 0);
    console.log('inputDate', inputDate);
    console.log('nowDateTime', nowDateTime);

    if (inputDate < nowDateTime)
      throw new BadRequestError(
        'Appointment date must be greater than or equal now date'
      );
    var startHappyHourD = new Date(dateTime);
    startHappyHourD.setHours(8, 30, 0); // 5.30 pm
    var endHappyHourD = new Date(dateTime);
    endHappyHourD.setHours(19, 30, 0);
    console.log(inputDate.getTime());
    console.log(startHappyHourD.getTime());
    console.log(endHappyHourD.getTime());

    if (
      inputDate.getTime() < startHappyHourD.getTime() ||
      inputDate.getTime() > endHappyHourD.getTime()
    )
      throw new BadRequestError('Appointment time between 8.30am and 19.30pm');
    if (inputDate.getTime() <= nowDateTime.getTime() + 1 * 60 * 60 * 1000)
      throw new BadRequestError(
        'Appointment time must be greater than now time least 1hour'
      );
    appointment.set({
      branch: branch,
      dateTime: inputDate,
      description: description,
    });
    await appointment.save();
    return appointment;
  }
  static async findAppointmentByNameOrPhone(key: string) {
    const customer = await User.findOne({
      $or: [{ fullName: new RegExp(key, 'i') }, { phoneNumber: key }],
    });
    if (!customer) throw new NotFoundError('Customer not found');
    console.log(customer.id);

    const appointments = await Appointment.find({
      customer: customer.id,
      isDeleted: false,
    })
      .populate('customer')
      .populate('creator')
      .populate('branch');
    const apmConverts: AppointmentConvert[] = [];
    for (const appointment of appointments) {
      const services = await AppointmentServiceServices.getAppointmentServices(
        appointment.id
      );
      const packages = await AppointmentPackageService.getAppointmentPackage(
        appointment.id
      );
      await appointment.save();
      const apmConvert: AppointmentConvert = {
        id: appointment.id,
        customerId: appointment.customer.id,
        customerName: appointment.customer.fullName,
        customerImageUrl: appointment.customer.avatar!,
        customerPhoneNumber: appointment.customer.phoneNumber,
        creatorId: appointment.creator.id,
        creatorName: appointment.creator.fullName,
        creatorImageUrl: appointment.creator.avatar!,
        branchId: appointment.branch.id,
        branchName: appointment.branch.name,
        dateTime: appointment.dateTime,
        status: appointment.status,
        description: appointment.description,
        services: services,
        packages: packages,
      };
      apmConverts.push(apmConvert);
    }
    return apmConverts;
  }
}
