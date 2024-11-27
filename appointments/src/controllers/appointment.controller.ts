import { Request, Response } from 'express';
import { AppointmentServices } from '../services/appointment.service';
import {
  AppointmentServiceServices,
  ServiceInAppointment,
} from '../services/appointment-service.service';
import {
  AppointmentPackageService,
  PackageInAppointment,
} from '../services/appointment-package.service';

export class AppointmentController {
  static async newAppointment(req: Request, res: Response) {
    try {
      const creatorId = req.currentUser!.id;
      const {
        customerId,
        branchId,
        dateTime,
        description,
        serviceAttrs,
        packageAttrs,
      } = req.body;
      const appointment = await AppointmentServices.newAppointment(
        creatorId,
        customerId,
        branchId,
        dateTime,
        description
      );
      let services: ServiceInAppointment[] = [];
      if (serviceAttrs) {
        services = await AppointmentServiceServices.newAppointmentServices(
          appointment.id,
          serviceAttrs
        );
      }
      let packages: PackageInAppointment[] = [];
      if (packageAttrs) {
        packages = await AppointmentPackageService.newAppointmentPackages(
          appointment.id,
          packageAttrs
        );
      }
      // create appoint - order
      //
      res.status(201).send({
        message: 'POST: new appoint successfully',
        appointment,
        services,
        packages,
      });
    } catch (error) {
      console.log(error);

      throw error;
    }
  }
  static async getAppointments(req: Request, res: Response) {
    const { id, type } = req.currentUser!;
    const { dateTime, date, pages, status } = req.query;
    try {
      const appointments = await AppointmentServices.getAppointments(
        id,
        type,
        pages as string,
        dateTime as string,
        date as string,
        status as string
      );
      res
        .status(200)
        .send({ message: 'GET: appointments successfully', appointments });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async getAppointment(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const appointment = await AppointmentServices.getAppointment(id);
      res
        .status(200)
        .send({ message: 'GET: Appointment successfully', appointment });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async cancelAppointment(req: Request, res: Response) {
    const { appointmentId } = req.params;
    const { id, type } = req.currentUser!;
    try {
      const appointment = await AppointmentServices.cancelAppointment(
        id,
        type,
        appointmentId
      );
      res.status(200).send({
        message: 'PATCH: Cancel appointment successfully',
        appointment,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async deleteAppointment(req: Request, res: Response) {
    const { appointmentId } = req.params;
    const { id, type } = req.currentUser!;
    try {
      const appointment = await AppointmentServices.deleteAppointment(
        id,
        type,
        appointmentId
      );
      res.status(200).send({
        message: 'PATCH: Delete appointment successfully',
        appointment,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
