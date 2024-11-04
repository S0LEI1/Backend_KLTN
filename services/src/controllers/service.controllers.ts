import express, { Request, Response } from 'express';
import { ServiceServices } from '../services/services.service';
import { checkImage } from '../utils/check-image';
import {
  BadRequestError,
  ListPermission,
  UserType,
} from '@share-package/common';
import { ServicePublishers } from '../services/services.publisher.service';
import { Check } from '../utils/check-type';
import { AwsServices } from '../services/aws.service';
export class ServiceControllers {
  static async new(req: Request, res: Response) {
    try {
      const { file } = req;
      const { name, description, costPrice, time, expire } = req.body;
      if (!file) throw new BadRequestError('Image must be provided');
      Check.checkImage(file);
      const service = await ServiceServices.new(
        name,
        file,
        description,
        costPrice,
        parseInt(time as string),
        parseInt(expire as string)
      );
      // ServicePublishers.new(service);
      res
        .status(201)
        .send({ message: 'POST: Add new services successfully', service });
    } catch (error) {
      console.log(error);
    }
  }
  static async readAll(req: Request, res: Response) {
    const {
      pages = 1,
      sortBy,
      lteDiscount,
      gteDiscount,
      ltePrice,
      gtePrice,
    } = req.query;
    let isManager = false;
    if (req.currentUser) {
      const { type, permissions } = req.currentUser!;
      isManager = Check.isManager(type, permissions, [
        ListPermission.ServiceRead,
      ]);
    }
    const { services, totalItems } = await ServiceServices.readAll(
      pages as string,
      sortBy as string,
      isManager,
      parseInt(lteDiscount as string),
      parseInt(gteDiscount as string),
      parseInt(ltePrice as string),
      parseInt(gtePrice as string)
    );
    res
      .status(200)
      .send({ message: 'GET: services successfully', services, totalItems });
  }
  static async readOne(req: Request, res: Response) {
    const { id } = req.params;
    let isManager = false;
    if (req.currentUser) {
      const { type, permissions } = req.currentUser!;
      isManager = Check.isManager(type, permissions, [
        ListPermission.ServiceRead,
      ]);
    }
    const service = await ServiceServices.readOne(id, isManager);
    res
      .status(200)
      .send({ message: 'GET: Service information successfully', service });
  }
  static async updateService(req: Request, res: Response) {
    const { id } = req.params;
    const { name, costPrice, description, discount, featured, time, expire } =
      req.body;
    const { file } = req;
    const isFeatured = (featured as string) === 'true' ? true : false;
    const service = await ServiceServices.update(
      id,
      file!,
      name,
      costPrice,
      description,
      discount,
      isFeatured,
      time as number,
      parseInt(expire as string)
    );
    ServicePublishers.updateService(service);
    res.status(200).send({ message: 'PATCH: service successfully', service });
  }
  static async deleteService(req: Request, res: Response) {
    const { id } = req.params;
    const service = await ServiceServices.deleteService(id);
    ServicePublishers.deleteService(service);
    res
      .status(200)
      .send({ message: 'PATCH: delete service successfully', service });
  }
  static async readByName(req: Request, res: Response) {
    try {
      const { name, pages = 1, sortBy } = req.query;
      const { type, permissions } = req.currentUser!;
      const isManager = Check.isManager(type, permissions, [
        ListPermission.ServiceRead,
      ]);
      const { services, totalItems } = await ServiceServices.readByName(
        name as string,
        isManager,
        pages as string,
        sortBy as string
      );
      res.status(200).send({
        message: 'GET: Service by name successfully',
        services,
        totalItems,
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async exportService(req: Request, res: Response) {
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="services.xlsx"`,
    });
    const workbook = await ServiceServices.exportService();
    workbook.xlsx.write(res);
  }
  static async importService(req: Request, res: Response) {
    const file = req.file;
    Check.checkExcel(file!);
    const { services, existServices } = await ServiceServices.importService(
      file!
    );
    res.status(201).send({
      message: 'Import services successfully',
      services,
      existServices,
    });
  }
}
