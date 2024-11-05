import { Request, Response } from 'express';
import { BadRequestError, ListPermission } from '@share-package/common';
import { SuplierServices } from '../services/suplier.service';
import { Check } from '../utils/check-type';
import exceljs from 'exceljs';
import { Suplier } from '../models/suplier';
import { SuplierPublisher } from '../services/suplier.publiser.service';

export class SuplierControllers {
  static async new(req: Request, res: Response) {
    const { name, description, phoneNumber, email, address, code } = req.body;
    const category = await SuplierServices.create(
      name,
      phoneNumber,
      email,
      address,
      description,
      code
    );
    SuplierPublisher.new(category);
    res
      .status(201)
      .send({ message: 'POST: create suplier successfully', category });
  }
  static async readAll(req: Request, res: Response) {
    const { pages = 1, sortBy, name } = req.query;
    const { supliers, totalItems } = await SuplierServices.readAll(
      pages as string,
      sortBy as string
    );
    res.status(200).send({
      message: 'GET: List supliers successfully',
      supliers,
      totalItems,
    });
  }
  static async readOne(req: Request, res: Response) {
    const { id } = req.params;
    const { pages = 1, sortBy } = req.query;
    let isManager = false;
    if (req.currentUser) {
      const { type, permissions } = req.currentUser!;
      isManager = Check.isManager(type, permissions, [
        ListPermission.ProductRead,
      ]);
    }
    const suplier = await SuplierServices.readOne(
      id,
      isManager,
      pages as string,
      sortBy as string
    );
    res.status(200).send({ message: 'GET: Suplier successfully', suplier });
  }
  static async findByName(req: Request, res: Response) {
    const { pages = 1, sortBy, name } = req.query;
    const suplier = await SuplierServices.findByName(
      name as string,
      pages as string,
      sortBy as string
    );
    res
      .status(200)
      .send({ message: 'GET: suplier by name successfully', suplier });
  }
  static async update(req: Request, res: Response) {
    const { name, description, phoneNumber, email, address, code } = req.body;
    const { id } = req.params;
    const existSuplier = await SuplierServices.update(
      id,
      name,
      description,
      phoneNumber,
      email,
      address,
      code
    );
    SuplierPublisher.update(existSuplier);
    res.status(200).send({
      message: 'PATCH: update suplier successfully',
      existSuplier,
    });
  }
  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    const suplier = await SuplierServices.delete(id);
    SuplierPublisher.delete(suplier);
    res.status(200).send({ message: 'PATCH: delete suplier successfully' });
  }
  static async exportSuplier(req: Request, res: Response) {
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="supliers.xlsx"`,
    });
    const workbook = await SuplierServices.exportSuplier();
    workbook.xlsx.write(res);
  }
  static async importSuplier(req: Request, res: Response) {
    const file = req.file;
    const { supliers, existSupliers } = await SuplierServices.importSuplier(
      file!
    );
    res.status(201).send({
      message: 'import suplier successfully',
      supliers,
      existSupliers,
    });
  }
}
