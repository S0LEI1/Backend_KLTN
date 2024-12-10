import {
  BadRequestError,
  NotFoundError,
  Pagination,
  calcPrice,
} from '@share-package/common';
import { Appointment, AppointmentDoc } from '../models/appointment';
import { User, UserDoc } from '../models/user';
import { Branch } from '../models/branch';
import { Service } from '../models/service';
import { AppointmentService } from '../models/appointment-service';
import _ from 'lodash';
import { OrderServiceM } from '../models/order-service';
export interface ServiceAttr {
  serviceId: string;
  quantity: number;
}
export interface ServiceInAppointment {
  serviceId: string;
  name: string;
  salePrice: number;
  imageUrl: string;
  quantity: number;
  totalPrice: number;
}
export class AppointmentServiceServices {
  static async newAppointmentService(
    appointmentDoc: AppointmentDoc,
    serviceAttr: ServiceAttr,
    orderId: string | null
  ) {
    const service = await Service.findService(serviceAttr.serviceId);
    if (!service) throw new NotFoundError('Service not found');
    const existAService = await AppointmentService.findOne({
      appointment: appointmentDoc.id,
      service: service.id,
      isDeleted: false,
    });
    if (existAService)
      throw new BadRequestError('Service existing in appointment');
    const totalPrice = calcPrice(
      service.salePrice,
      serviceAttr.quantity,
      service.discount
    );
    const aService = AppointmentService.build({
      appointment: appointmentDoc,
      service: service,
      quantity: serviceAttr.quantity,
      totalPrice: totalPrice,
    });
    if (orderId) {
      const oService = await OrderServiceM.findOne({
        order: orderId,
        service: service.id,
      });
      if (!oService) throw new NotFoundError('Order-Service');
      const { usageLogs, quantity } = oService;
      if (usageLogs!.length >= quantity)
        throw new BadRequestError('Number of Uses Exhausted.');
      if (serviceAttr.quantity > oService.quantity)
        throw new BadRequestError(
          'Service quantity in appoinment cannot greater quantity in order'
        );
    }
    await aService.save();
    return { aService, service };
  }
  static async newAppointmentServices(
    appointment: AppointmentDoc,
    serviceAttrs: ServiceAttr[],
    orderId: string | null
  ) {
    // const appointmentDoc = await Appointment.findAppointment(appointment.id);
    // if (!appointmentDoc) throw new NotFoundError('Appointment');
    const services: ServiceInAppointment[] = [];
    let totalServicePrice = 0;
    for (const serviceAttr of serviceAttrs) {
      const { aService, service } = await this.newAppointmentService(
        appointment,
        serviceAttr,
        orderId
      );
      services.push({
        serviceId: service.id,
        name: service.name,
        salePrice: service.salePrice,
        imageUrl: service.imageUrl,
        quantity: aService.quantity,
        totalPrice: aService.totalPrice,
      });
      totalServicePrice += aService.totalPrice;
    }
    return { services, totalServicePrice };
  }
  static async getAppointmentServices(appointmentId: string) {
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      isDeleted: false,
    });
    if (!appointment) throw new NotFoundError('Appointment');
    const aServices = await AppointmentService.find({
      appointment: appointment.id,
      isDeleted: false,
    }).populate('service');
    // .populate({ path: 'execEmp', select: 'id fullName avatar gender' });
    const services: ServiceInAppointment[] = [];
    let totalServicePrice = 0;
    for (const as of aServices) {
      services.push({
        serviceId: as.service.id,
        name: as.service.name,
        salePrice: as.service.salePrice,
        imageUrl: as.service.imageUrl,
        quantity: as.quantity,
        totalPrice: as.totalPrice,
      });
      totalServicePrice += as.totalPrice;
    }
    return { services, totalServicePrice };
  }
  static async deleteAppointmentService(
    appointmentDoc: AppointmentDoc,
    serviceAttr: ServiceAttr
  ) {
    const filter = Pagination.query();
    filter.appointment = appointmentDoc.id;
    filter.service = serviceAttr.serviceId;
    filter.isDeleted = false;
    const aService = await AppointmentService.findOne(filter);
    if (!aService) throw new NotFoundError('Appointment-Service');
    aService.set({ isDeleted: true });
    await aService.save();
  }
  static async deleteAppointmentServices(
    appointmentDoc: AppointmentDoc,
    serviceAttrs: ServiceAttr[]
  ) {
    for (const serviceAttr of serviceAttrs) {
      await this.deleteAppointmentService(appointmentDoc, serviceAttr);
    }
  }
  static async updateAppointmentService(
    appointmentDoc: AppointmentDoc,
    serviceAttr: ServiceAttr,
    orderId: string | null
  ) {
    const filter = Pagination.query();
    filter.appointment = appointmentDoc.id;
    filter.service = serviceAttr.serviceId;
    filter.isDeleted = false;
    const aService = await AppointmentService.findOne(filter)
      .populate('service')
      .populate('appointment');
    // .populate('order');
    if (!aService) throw new NotFoundError('Appointment-Service');
    if (aService.quantity === serviceAttr.quantity) return aService;
    const price = calcPrice(
      aService.service.salePrice,
      serviceAttr.quantity,
      aService.service.discount!
    );
    aService.set({
      quantity: serviceAttr.quantity,
      totalPirce: price,
    });
    await aService.save();
    return aService;
  }
  static async updateAppointmentServices(
    appointmentId: string,
    serviceAttrs: ServiceAttr[],
    orderId: string | null
  ) {
    const appointmentDoc = await Appointment.findAppointment(appointmentId);
    if (!appointmentDoc) throw new NotFoundError('Appointment');
    const { services, totalServicePrice } = await this.getAppointmentServices(
      appointmentDoc.id
    );
    const existServiceAttrs: ServiceAttr[] = [];
    for (const srv of services) {
      // const execEmpId: string[] = srv.execEmp.map((exec) => exec.id);
      const serviceAttr: ServiceAttr = {
        serviceId: srv.serviceId,
        quantity: srv.quantity,
        // execEmp: execEmpId,
      };
      existServiceAttrs.push(serviceAttr);
    }
    const deleteValue = _.differenceBy(
      existServiceAttrs,
      serviceAttrs,
      'serviceId'
    );
    const updateValue = _.intersectionBy(
      serviceAttrs,
      existServiceAttrs,
      'serviceId'
    );
    const addValue = _.differenceBy(
      serviceAttrs,
      existServiceAttrs,
      'serviceId'
    );
    console.log('addService', addValue);
    console.log('updateService', updateValue);
    console.log('deleteService', deleteValue);

    const addServices = await this.newAppointmentServices(
      appointmentDoc,
      addValue,
      orderId
    );
    const updateServices: ServiceInAppointment[] = [];
    let updateServicePrices = 0;
    for (const value of updateValue) {
      const aService = await this.updateAppointmentService(
        appointmentDoc,
        value,
        orderId
      );
      updateServices.push({
        serviceId: aService.service.id,
        name: aService.service.name,
        salePrice: aService.service.salePrice,
        imageUrl: aService.service.imageUrl,
        quantity: aService.quantity,
        totalPrice: aService.totalPrice,
      });
      updateServicePrices += aService.totalPrice;
    }
    await this.deleteAppointmentServices(appointmentDoc, deleteValue);
    const serviceInAppointment: ServiceInAppointment[] = [];
    serviceInAppointment.push(...addServices.services);
    serviceInAppointment.push(...updateServices);
    const totalPrice = addServices.totalServicePrice + updateServicePrices;
    return { serviceInAppointment, totalPrice };
  }
}
