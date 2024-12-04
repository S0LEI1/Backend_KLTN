import {
  AppointmentStatus,
  BadRequestError,
  NotFoundError,
  Pagination,
  UserType,
} from '@share-package/common';
import { Appointment, AppointmentDoc } from '../models/appointment';

import { User, UserDoc } from '../models/user';
import { Branch } from '../models/branch';
import {
  AppointmentServiceServices,
  ServiceAttr,
  ServiceInAppointment,
} from './appointment-service.service';
import {
  AppointmentPackageService,
  PackageInAppointment,
} from './appointment-package.service';
import { format } from 'date-fns';
import { AppointmentService } from '../models/appointment-service';
import { AppointmentPackage } from '../models/appointment-package';
import { ServiceAttrs } from '../models/service';
import { AppointmentConvert, Convert } from '../utils/convert';
import { PackageAttr } from './appointment-package.service';
const PER_PAGE = process.env.PER_PAGE;

export class AppointmentServices {
  static async newAppointment(
    creatorId: string,
    customerId: string,
    consultantId: string,
    branchId: string,
    dateTime: Date,
    description: string,
    type: string
  ) {
    if (type === UserType.Customer) customerId = creatorId;
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

    if (
      inputDate.getTime() < startHappyHourD.getTime() ||
      inputDate.getTime() > endHappyHourD.getTime()
    )
      throw new BadRequestError('Appointment time between 8.30am and 19.30pm');
    if (inputDate.getTime() <= nowDateTime.getTime() + 1 * 60 * 60 * 1000)
      throw new BadRequestError(
        'Appointment time must be greater than now time least 1hour'
      );
    if (inputDate.getTime() > nowDateTime.getTime() + 30 * 24 * 60 * 60 * 1000)
      throw new BadRequestError(
        'Appointment date must be leaster than or equal 1 month'
      );
    const existApm = await Appointment.findOne({
      customer: customer.id,
      dateTime: dateTime,
      isDeleted: false,
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
    // find consultant
    let consultant: UserDoc | null = null;
    if (consultantId) {
      consultant = await User.findEmployee(consultantId);
      if (!consultant) throw new NotFoundError('Employee not found');
      apm.set({ consultant: consultant });
      await apm.save();
    }
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
      consultantId: apm.consultant?.id,
      consultantName: apm.consultant?.fullName,
      consultantImageUrl: apm.consultant?.avatar!,
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
    status: string,
    creatorId: string,
    customerId: string
  ) {
    const filter = Pagination.query();
    filter.isDeleted = false;
    if (type === UserType.Customer) filter.customer = userId;
    if (type !== UserType.Customer && customerId) filter.customer = customerId;
    if (creatorId) filter.creator = creatorId;
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
      .populate('branch')
      .populate('consultant');
    const totalDocuments = await Appointment.find(
      filter,
      {},
      options
    ).countDocuments();
    const apmConverts: AppointmentConvert[] = [];
    let services: ServiceInAppointment[] = [];
    let packages: PackageInAppointment[] = [];
    let totalPrice: number = 0;
    for (const apm of appointments) {
      const aService = await AppointmentService.findByAppointment(apm);
      if (aService) {
        const servicesInAppointment =
          await AppointmentServiceServices.getAppointmentServices(apm.id);
        services = servicesInAppointment.services;
        totalPrice += servicesInAppointment.totalServicePrice;
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
        consultantId: apm.consultant?.id,
        consultantName: apm.consultant?.fullName,
        consultantImageUrl: apm.consultant?.avatar!,
        branchId: apm.branch.id,
        branchName: apm.branch.name,
        dateTime: apm.dateTime,
        status: apm.status,
        description: apm.description,
        services: services,
        packages: packages,
      });
    }
    return { apmConverts, totalDocuments };
  }
  static async getAppointment(id: string) {
    const appointment = await Appointment.findAppointment(id);
    if (!appointment) throw new NotFoundError('Appointment');
    const { services, totalServicePrice } =
      await AppointmentServiceServices.getAppointmentServices(appointment.id);
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
    const { services, totalServicePrice } =
      await AppointmentServiceServices.getAppointmentServices(appointment.id);
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
    userId: string,
    type: string,
    appointmentId: string,
    branchId: string,
    consultantId: string,
    dateTime: Date,
    description: string,
    serviceAttrs: ServiceAttr[],
    packageAttrs: PackageAttr[]
  ) {
    const appointment = await Appointment.findAppointment(appointmentId);
    if (!appointment) throw new NotFoundError('Appointment');
    if (type === UserType.Customer && userId !== appointment.customer.id)
      throw new BadRequestError('You are not the owner of the appointment');
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
    if (
      inputDate.getTime() < startHappyHourD.getTime() ||
      inputDate.getTime() > endHappyHourD.getTime()
    )
      throw new BadRequestError('Appointment time between 8.30am and 19.30pm');
    if (inputDate.getTime() <= nowDateTime.getTime() + 1 * 60 * 60 * 1000)
      throw new BadRequestError(
        'Appointment time must be greater than now time least 1hour'
      );
    const consultant = await User.findEmployee(consultantId);
    if (!consultant) throw new NotFoundError('Consultant employee');
    appointment.set({
      branch: branch,
      consultant: consultant,
      dateTime: inputDate,
      description: description,
    });
    await appointment.save();
    let services: ServiceInAppointment[] = [];
    if (serviceAttrs) {
      services = await AppointmentServiceServices.updateAppointmentServices(
        appointmentId,
        serviceAttrs
      );
    }
    let packages: PackageInAppointment[] = [];
    if (packageAttrs) {
      packages = await AppointmentPackageService.updateAppointmentServices(
        appointmentId,
        packageAttrs
      );
    }
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
      const { services, totalServicePrice } =
        await AppointmentServiceServices.getAppointmentServices(appointment.id);
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
      apmConverts.push(apmConvert);
    }
    return apmConverts;
  }
  static async completeAppoinment(appointmentId: string) {
    const appointment = await Appointment.findAppointment(appointmentId);
    if (!appointment) throw new NotFoundError('Appointment');
    if (appointment.status === AppointmentStatus.Cancelled)
      throw new BadRequestError('Cannot complete for an cancelled appointment');
    if (appointment.status === AppointmentStatus.Complete)
      throw new BadRequestError('Cannot complete for an complete appointment');
    appointment.set({ status: AppointmentStatus.Complete });
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
    };
    return apmConvert;
  }
}
