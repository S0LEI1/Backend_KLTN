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
import { UserType } from '@share-package/common';

export class AppointmentController {
  static async newAppointment(req: Request, res: Response) {
    try {
      const creatorId = req.currentUser!.id;
      const type = req.currentUser!.type;
      const {
        customerId,
        branchId,
        dateTime,
        description,
        serviceAttrs,
        packageAttrs,
        consultantId,
      } = req.body;

      const appointment = await AppointmentServices.newAppointment(
        creatorId,
        customerId,
        consultantId,
        branchId,
        dateTime,
        description,
        type
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
      const { apmConverts, totalDocuments } =
        await AppointmentServices.getAppointments(
          id,
          type,
          pages as string,
          dateTime as string,
          date as string,
          status as string
        );
      res.status(200).send({
        message: 'GET: appointments successfully',
        totalDocuments,
        appointments: apmConverts,
      });
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
  static async findAppointmentByNameOrPhone(req: Request, res: Response) {
    const { key } = req.query;
    try {
      const appointments =
        await AppointmentServices.findAppointmentByNameOrPhone(key as string);
      res.status(200).send({
        message: 'GET: Appointment by name or phone number successfully',
        appointments,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async updateAppointment(req: Request, res: Response) {
    try {
      const {
        branchId,
        dateTime,
        description,
        serviceAttrs,
        packageAttrs,
        consultantId,
      } = req.body;
      const { appointmentId } = req.params;
      const { id, type } = req.currentUser!;
      const appointment = await AppointmentServices.updateAppointment(
        id,
        type,
        appointmentId,
        branchId,
        consultantId,
        dateTime,
        description,
        serviceAttrs,
        packageAttrs
      );

      res
        .status(200)
        .send({ message: 'PATCH: update appoint successfully', appointment });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
