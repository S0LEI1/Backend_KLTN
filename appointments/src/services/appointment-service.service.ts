import { BadRequestError, NotFoundError } from '@share-package/common';
import { Appointment, AppointmentDoc } from '../models/appointment';
import { User, UserDoc } from '../models/user';
import { Branch } from '../models/branch';
import { Service } from '../models/service';
import { AppointmentService } from '../models/appointment-service';
interface ServiceAttr {
  id: string;
  execEmp?: string[];
  quantity: number;
}
export interface ServiceInAppointment {
  serviceId: string;
  name: string;
  salePrice: number;
  imageUrl: string;
  quantity: number;
  execEmp: UserDoc[];
}
export class AppointmentServiceServices {
  static async newAppointmentService(
    appointmentDoc: AppointmentDoc,
    serviceAttr: ServiceAttr
  ) {
    const service = await Service.findService(serviceAttr.id);
    if (!service) throw new NotFoundError('Service not found');
    const existAService = await AppointmentService.findOne({
      appointment: appointmentDoc.id,
      service: service.id,
    });
    if (existAService)
      throw new BadRequestError('Service existing in appointment');
    const aService = AppointmentService.build({
      appointment: appointmentDoc,
      service: service,
      quantity: serviceAttr.quantity,
    });
    let employeesInAppointment: UserDoc[] = [];
    if (serviceAttr.execEmp) {
      const execEmp = await User.findEmployees(serviceAttr.execEmp);
      if (!execEmp) throw new NotFoundError('Execute employee not found');
      employeesInAppointment = execEmp;
      aService.set({ execEmp: execEmp });
    }
    await aService.save();
    return { aService, service, employeesInAppointment };
  }
  static async newAppointmentServices(
    appointmentId: string,
    serviceAttrs: ServiceAttr[]
  ) {
    console.log(appointmentId);

    const appointmentDoc = await Appointment.findAppointment(appointmentId);
    if (!appointmentDoc) throw new NotFoundError('Appointment');
    const services: ServiceInAppointment[] = [];
    for (const serviceAttr of serviceAttrs) {
      const { aService, service, employeesInAppointment } =
        await this.newAppointmentService(appointmentDoc, serviceAttr);
      services.push({
        serviceId: service.id,
        name: service.name,
        salePrice: service.salePrice,
        imageUrl: service.imageUrl,
        quantity: aService.quantity,
        execEmp: employeesInAppointment,
      });
    }
    return services;
  }
  static async getAppointmentServices(appointmentId: string) {
    const appointment = await Appointment.findAppointment(appointmentId);
    if (!appointment) throw new NotFoundError('Appointment');
    const aServices = await AppointmentService.find({
      appointment: appointment.id,
      isDeleted: false,
    })
      .populate('service')
      .populate({ path: 'execEmp', select: 'id fullName avatar gender' });
    const services: ServiceInAppointment[] = [];
    aServices.map((as) => {
      services.push({
        serviceId: as.service.id,
        name: as.service.name,
        salePrice: as.service.salePrice,
        imageUrl: as.service.imageUrl,
        quantity: as.quantity,
        execEmp: as.execEmp!,
      });
    });

    return services;
  }
}
