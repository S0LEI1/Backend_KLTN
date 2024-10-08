import { BadRequestError, ListPermission } from '@share-package/common';
import { Request, Response } from 'express';
import { PackageServices } from '../services/packages.service';
import { Check } from '../utils/check-type';

export class PackageControllers {
  static async newPackage(req: Request, res: Response) {
    try {
      const { files } = req;
      const { name, costPrice, description } = req.body;
      if (files === undefined) throw new BadRequestError('Image must be valid');
      const newPackage = await PackageServices.newPackage(
        name,
        costPrice,
        files as Express.Multer.File[],
        description
      );
      res
        .status(201)
        .send({ message: 'POST: new package successfully', newPackage });
    } catch (error) {
      console.log(error);
    }
  }
  static async readAll(req: Request, res: Response) {
    const {
      pages = 1,
      sortBy,
      featured,
      lteDiscount,
      gteDiscount,
      ltePrice,
      gtePrice,
      price,
    } = req.query;
    const { type, permissions } = req.currentUser!;
    const isManager = Check.isManager(type, permissions, [
      ListPermission.PackageRead,
    ]);
    const { packages, totalItems } = await PackageServices.readAll(
      pages as string,
      sortBy as string,
      featured as string,
      parseInt(lteDiscount as string),
      parseInt(gteDiscount as string),
      parseInt(ltePrice as string),
      parseInt(gtePrice as string),
      isManager
    );
    res
      .status(200)
      .send({ message: 'GET: Packages successfully', packages, totalItems });
  }
  static async readOne(req: Request, res: Response) {
    const { id } = req.params;
    const { type, permissions } = req.currentUser!;
    const isManager = Check.isManager(type, permissions, [
      ListPermission.PackageRead,
    ]);
    const response = await PackageServices.readOne(id, isManager);
    res.status(200).send({ message: 'GET: Package successfully', response });
  }
  static async deletePackage(req: Request, res: Response) {
    const { id } = req.params;
    const deletePackage = await PackageServices.deletedPackage(id);
    res
      .status(200)
      .send({
        message: 'PATCH: Delete package successfully',
        package: deletePackage,
      });
  }
}
