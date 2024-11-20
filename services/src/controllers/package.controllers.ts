import { BadRequestError, ListPermission } from '@share-package/common';
import { Request, Response } from 'express';
import { PackageServices } from '../services/packages.service';
import { Check } from '../utils/check-type';
import { Package } from '../models/package';
import { PackagePublisher } from '../services/package.publisher.service';
import { ServiceAttrs } from '../services/package-serivce.service';

export class PackageControllers {
  static async newPackage(req: Request, res: Response) {
    const { file } = req;
    const { name, costPrice, description, count, expire, code, services } =
      req.body;
    try {
      const { newPackage, servicesInPackage } =
        await PackageServices.newPackage(
          name,
          costPrice,
          file as Express.Multer.File,
          description,
          count,
          expire,
          code,
          services
        );
      res.status(201).send({
        message: 'POST: new package successfully',
        pakage: newPackage,
        services: servicesInPackage,
      });
    } catch (error) {
      console.log(error);
    }
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
    // const { type, permissions } = req.currentUser!;
    // const isManager = Check.isManager(type, permissions, [
    //   ListPermission.PackageRead,
    // ]);
    let isManager = false;
    if (req.currentUser) {
      const { type, permissions } = req.currentUser!;
      isManager = Check.isManager(type, permissions, [
        ListPermission.PackageRead,
      ]);
    }
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
    let isManager = false;
    if (req.currentUser) {
      const { type, permissions } = req.currentUser!;
      isManager = Check.isManager(type, permissions, [
        ListPermission.PackageRead,
      ]);
    }
    const { existPackage, services } = await PackageServices.readOne(
      id,
      isManager
    );
    res.status(200).send({
      message: 'GET: Package successfully',
      package: existPackage,
      services,
    });
  }
  static async deletePackage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletePackage = await PackageServices.deletedPackage(id);
      res.status(200).send({
        message: 'PATCH: Delete package successfully',
        package: deletePackage,
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async updatePackage(req: Request, res: Response) {
    const { id } = req.params;
    const {
      name,
      costPrice,
      salePrice,
      discount,
      count,
      expire,
      featured,
      description,
      code,
      services,
    } = req.body;
    const file = req.file;
    try {
      const { existPackage, serviceInPackage } =
        await PackageServices.updatePackage({
          id: id,
          name: name,
          costPrice: costPrice,
          // salePrice: salePrice,
          discount: discount,
          count: count,
          expire: expire,
          file: file!,
          featured: featured === 'true' ? true : false,
          description: description,
          code: code,
          services: services,
        });
      res.status(200).send({
        message: 'Update package successfully',
        package: existPackage,
        services: serviceInPackage,
      });
    } catch (error) {
      console.log(error);
    }
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
  static async updateCode(req: Request, res: Response) {
    const packages = await Package.find();
    for (let i = 0; i < packages.length; i++) {
      packages[i].set({ code: `PKG${i}` });
      await packages[i].save();
      PackagePublisher.updatedPackage(packages[i]);
    }
    res.status(200).send({ message: 'Done' });
  }
}
