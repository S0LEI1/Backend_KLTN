import { BadRequestError, ListPermission } from '@share-package/common';
import { Request, Response } from 'express';
import { PackageServices } from '../services/packages.service';
import { Check } from '../utils/check-type';

export class PackageControllers {
  static async newPackage(req: Request, res: Response) {
    const { file } = req;
    const { name, costPrice, description, count, expire, code, serviceIds } =
      req.body;
    const { newPackage, packageServices } = await PackageServices.newPackage(
      name,
      costPrice,
      file as Express.Multer.File,
      description,
      count,
      expire,
      code,
      serviceIds as string[]
    );
    res.status(201).send({
      message: 'POST: new package successfully',
      newPackage,
      packageServices,
    });
  }
  static async readAll(req: Request, res: Response) {
    const {
      pages = 1,
      name,
      priceRange,
      price,
      discountRange,
      discount,
      featured,
      countRange,
      count,
      expireRange,
      expire,
    } = req.query;
    const { type, permissions } = req.currentUser!;
    const isManager = Check.isManager(type, permissions, [
      ListPermission.PackageRead,
    ]);
    const { packages, totalItems } = await PackageServices.readAll(
      pages as string,
      name as string,
      isManager,
      priceRange as string,
      price as string,
      discountRange as string,
      discount as string,
      featured as string,
      countRange as string,
      count as string,
      expireRange as string,
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
      code,
    } = req.body;
    const file = req.file;
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
      code: code,
    });
    res.status(200).send({
      message: 'Update package successfully',
      package: updatePackage,
    });
  }
  static async exportPackage(req: Request, res: Response) {
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="package.xlsx"`,
    });
    const workbook = await PackageServices.exportPackage();
    workbook.xlsx.write(res);
    // res.status(200).send({ workbook });
  }
}
