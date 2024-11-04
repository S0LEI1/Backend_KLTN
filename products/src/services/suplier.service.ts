import {
  BadRequestError,
  NotFoundError,
  Pagination,
} from '@share-package/common';
import { Suplier, SuplierDoc } from '../models/suplier';
import { ProductService } from './products.service';
import { Convert } from '../utils/convert';
import exceljs from 'exceljs';
import { Check } from '../utils/check-type';
import { SuplierPublisher } from './suplier.publiser.service';
const PER_PAGE = process.env.PER_PAGE;
export class SuplierServices {
  static async create(
    name: string,
    phoneNumber: string,
    email: string,
    address: string,
    description: string
  ) {
    const existSuplier = await Suplier.findOne({ name: name });
    if (existSuplier) throw new BadRequestError('Suplier name existing');
    const suplier = Suplier.build({
      name: name,
      description: description,
      phoneNumber: phoneNumber,
      email: email,
      address: address,
    });
    await suplier.save();
    return suplier;
  }
  static async readAll(pages: string, name: string) {
    const query = Pagination.query();
    query.isDeleted = false;
    const sort = Pagination.query();
    sort.name = 1;
    if (name === 'desc') sort.name = -1;
    const options = Pagination.options(pages, PER_PAGE!, sort);
    const totalItems = await Suplier.find(query).countDocuments();
    const supliers = await Suplier.find(query, null, options);
    if (!supliers) throw new NotFoundError('Categories');
    return { supliers, totalItems };
  }
  static async readOne(
    id: string,
    isManager: boolean,
    pages: string,
    sortBy: string
  ) {
    const query = Pagination.query();
    query._id = id;
    query.isDeleted = false;
    const suplier = await Suplier.findOne(query);
    if (!suplier) throw new NotFoundError('Suplier');
    return suplier;
  }
  static async findByName(name: string, pages: string, sortBy: string) {
    const query = Pagination.query();
    query.name = new RegExp(name, 'i');
    query.isDeleted = false;
    const sort = Pagination.query();
    sort.name = 1;
    if (sortBy === 'desc') sort.name = -1;
    const options = Pagination.options(pages, PER_PAGE!, sort);
    const suplier = await Suplier.find(query, null, options);
    if (!suplier) throw new NotFoundError('Suplier by name');
    return suplier;
  }
  static async update(
    id: string,
    name: string,
    description: string,
    phoneNumber: string,
    email: string,
    address: String
  ) {
    const existSuplier = await Suplier.findById(id);
    if (!existSuplier) throw new NotFoundError('Suplier update');
    existSuplier.set({
      name: name,
      description: description,
      phoneNumber: phoneNumber,
      email: email,
      address: address,
    });
    await existSuplier.save();
    return existSuplier;
  }
  static async delete(id: string) {
    const query = Pagination.query();
    query._id = id;
    query.isDeleted = false;
    const existSuplier = await Suplier.findOne(query);
    if (!existSuplier) throw new NotFoundError('Suplier delete');
    existSuplier.set({ isDeleted: true });
    await existSuplier.save();
    return existSuplier;
  }
  static async exportSuplier() {
    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet('Suplier');
    const supliers = await Suplier.find({ isDeleted: false });
    if (supliers.length <= 0) {
      throw new BadRequestError('Supliers not found');
    }
    sheet.columns = [
      { header: 'Tên nhà cung cấp', key: 'name', width: 35 },
      {
        header: 'Số điện thoại',
        key: 'phoneNumber',
        width: 15,
      },
      {
        header: 'Email',
        key: 'email',
        width: 15,
      },
      {
        header: 'Địa chỉ',
        key: 'address',
        width: 25,
      },
      {
        header: 'Mô tả',
        key: 'description',
        width: 50,
      },
    ];
    supliers.map((value, index) => {
      sheet.addRow(value);
      let rowIndex = 1;
      for (rowIndex; rowIndex <= sheet.rowCount; rowIndex++) {
        sheet.getRow(rowIndex).alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true,
        };
      }
    });
    return workbook;
  }
  static async importSuplier(file: Express.Multer.File) {
    Check.checkExcel(file!);
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(file.path);
    const supliers: SuplierDoc[] = [];
    const existSupliers: SuplierDoc[] = [];
    const rowData: any[] = [];
    for (const worksheet of workbook.worksheets) {
      const rowNumber = worksheet.rowCount;
      for (let i = 2; i <= rowNumber; i++) {
        const row = worksheet.getRow(i);
        if (!row.hasValues) {
          continue;
        }
        const existSuplier = await Suplier.findOne({
          name: row.getCell(1).value as string,
          isDeleted: false,
        });
        if (existSuplier) {
          existSupliers.push(existSuplier);
          continue;
        }
        const suplier = Suplier.build({
          name: row.getCell(1).value as string,
          phoneNumber: row.getCell(2).value as string,
          email: row.getCell(3).value as string,
          address: row.getCell(4).value as string,
          description: row.getCell(5).value as string,
        });
        await suplier.save();
        SuplierPublisher.new(suplier);
        supliers.push(suplier);
      }
    }
    return { supliers, existSupliers };
  }
}
