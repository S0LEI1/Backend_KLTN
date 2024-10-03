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
export class ServiceControllers {
  static async new(req: Request, res: Response) {
    const { file } = req;
    const { name, description, costPrice } = req.body;
    if (!file) throw new BadRequestError('Image must be provided');
    Check.checkImage(file);
    const service = await ServiceServices.new(
      name,
      file,
      description,
      costPrice
    );
    // ServicePublishers.new(service);
    res
      .status(201)
      .send({ message: 'POST: Add new services successfully', service });
  }
  static async readAll(req: Request, res: Response) {
    const { pages = 1, sortBy, filter } = req.query;
    const { type, permissions } = req.currentUser!;
    const isManager = Check.isManager(type, permissions, [
      ListPermission.ServiceRead,
    ]);
    const { services, totalItems } = await ServiceServices.readAll(
      pages as string,
      sortBy as string,
      isManager
    );
    res
      .status(200)
      .send({ message: 'GET: services successfully', services, totalItems });
  }
  static async readOne(req: Request, res: Response) {
    const { id } = req.params;
    const { type, permissions } = req.currentUser!;
    const isManager = Check.isManager(type, permissions, [
      ListPermission.ServiceRead,
    ]);
    const service = await ServiceServices.readOne(id, isManager);
    res
      .status(200)
      .send({ message: 'GET: Service information successfully', service });
  }
}
