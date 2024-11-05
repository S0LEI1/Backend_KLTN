import { BadRequestError, ListPermission } from '@share-package/common';
import { Request, Response } from 'express';
import { PackageServices } from '../services/packages.service';
import { Check } from '../utils/check-type';

export class PackageControllers {
  static async newPackage(req: Request, res: Response) {
    try {
      const { file } = req;
      const { name, costPrice, description, count, expire } = req.body;
      const newPackage = await PackageServices.newPackage(
        name,
        costPrice,
        file as Express.Multer.File,
        description,
        count,
        expire
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
      lteDiscount,
      gteDiscount,
      ltePrice,
      gtePrice,
      price,
      discount,
      featured,
      lteCount,
      gteCount,
      count,
      lteExpire,
      gteExpire,
      expire,
    } = req.query;
    const { type, permissions } = req.currentUser!;
    const isManager = Check.isManager(type, permissions, [
      ListPermission.PackageRead,
    ]);
    const { packages, totalItems } = await PackageServices.readAll(
      pages as string,
      sortBy as string,
      parseInt(lteDiscount as string),
      parseInt(gteDiscount as string),
      parseInt(ltePrice as string),
      parseInt(gtePrice as string),
      isManager,
      price as string,
      discount as string,
      (featured as string) === 'true' ? true : false,
      parseInt(lteCount as string),
      parseInt(gteCount as string),
      count as string,
      parseInt(lteExpire as string),
      parseInt(gteExpire as string),
      expire as string
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
    const { existPackage, notInSerivce, services } =
      await PackageServices.readOne(id, isManager);
    res.status(200).send({
      message: 'GET: Package successfully',
      package: existPackage,
      notInSerivce,
      services,
    });
  }
  static async deletePackage(req: Request, res: Response) {
    const { id } = req.params;
    const deletePackage = await PackageServices.deletedPackage(id);
    res.status(200).send({
      message: 'PATCH: Delete package successfully',
      package: deletePackage,
    });
  }
  static async updatePackage(req: Request, res: Response) {
    const { id } = req.params;
    const {
      name,
      costPrice,
      salePrice,
      discount,
      count,
      time,
      featured,
      description,
    } = req.body;
    const file = req.file;
    try {
      const updatePackage = await PackageServices.updatePackage({
        id: id,
        name: name,
        costPrice: parseInt(costPrice as string),
        // salePrice: parseInt(salePrice as string),
        discount: parseInt(discount as string),
        count: parseInt(count as string),
        expire: parseInt(time as string),
        file: file!,
        featured: featured === 'true' ? true : false,
        description: description,
      });
      res.status(200).send({
        message: 'Update package successfully',
        package: updatePackage,
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async exportPackage(req: Request, res: Response) {
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="package-services.xlsx"`,
    });
    const workbook = await PackageServices.exportPackage();
    workbook.xlsx.write(res);
  }
}
