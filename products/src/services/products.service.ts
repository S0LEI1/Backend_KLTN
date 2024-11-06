import {
  BadRequestError,
  NotFoundError,
  Pagination,
} from '@share-package/common';
import { Category } from '../models/category';
import { Product, ProductDoc } from '../models/product';
import { Suplier } from '../models/suplier';
import { checkImage } from '../utils/check-image';
import { AwsServices } from './aws.service';
import { Convert } from '../utils/convert';
import { Check } from '../utils/check-type';
import exceljs from 'exceljs';
import mongoose, { ObjectId } from 'mongoose';
import { ProductPublisher } from './product.publisher.service';
interface ProductAttrs {
  name: string;
  description: string;
  categoryId: string;
  suplierId: string;
  expire: Date;
  costPrice: number;
  quantity: number;
  file?: Express.Multer.File;
  discount?: number;
  code: string;
}
const PER_PAGE = process.env.PER_PAGE;
export class ProductService {
  static async new(productAttrs: ProductAttrs) {
    try {
      const existProduct = await Product.findByName(productAttrs.name);
      const existCode = await Product.findOne({
        code: productAttrs.code,
        isDeleted: false,
      });
      if (existCode) throw new BadRequestError('Product code is exist');
      const category = await Category.findCategory(productAttrs.categoryId);
      const suplier = await Suplier.findSuplier(productAttrs.suplierId);
      checkImage(productAttrs.file!);
      const imageUrl = await AwsServices.uploadFile(productAttrs.file!);
      const salePrice =
        productAttrs.costPrice + (productAttrs.costPrice * 10) / 100;
      const product = Product.build({
        name: productAttrs.name,
        description: productAttrs.description,
        category: category!,
        suplier: suplier!,
        imageUrl: imageUrl!,
        expire: productAttrs.expire,
        costPrice: productAttrs.costPrice,
        salePrice: salePrice,
        quantity: productAttrs.quantity,
        code: productAttrs.code,
      });
      await product.save();
      return product;
    } catch (error) {
      console.log(error);
    }
  }
  static async readAll(
    pages: string,
    sortBy: string,
    isManager: boolean,
    category: string,
    suplier: string,
    lteDiscount: number,
    gteDiscount: number,
    ltePrice: number,
    gtePrice: number,
    // createdAt: Date,
    quantity: string,
    expire: string,
    name: string
  ) {
    const query = Pagination.query();
    const sort = Pagination.query();
    query.isDeleted = false;
    if (category) query.category = category;
    if (suplier) query.suplier = suplier;
    if (gteDiscount) query.discount = { $gte: gteDiscount };
    if (lteDiscount) query.discount = { $lte: lteDiscount };
    if (gteDiscount && lteDiscount)
      query.discount = { $gte: gteDiscount, $lte: lteDiscount };
    if (gtePrice) query.salePrice = { $gte: gtePrice };
    if (ltePrice) query.salePrice = { $lte: ltePrice };
    if (gtePrice && ltePrice)
      query.salePrice = { $gte: gtePrice, $lte: ltePrice };

    // if (createdAt) {
    //   createdAt.setHours(0, 0, 0, 0);
    //   query.createdAt = { $lte: createdAt };
    // }
    if (quantity === 'instock') query.quantity = { $gte: 10 };
    if (quantity === 'outofstock') query.quantity = 0;
    if (quantity === 'runninglow') query.quantity = { $lt: 10, $gte: 1 };

    // sort
    sort.featured = -1;
    sort.name = 1;
    if (expire === 'asc') sort.expire = 1;
    if (expire === 'desc') sort.expire = -1;
    const options = Pagination.options(pages, PER_PAGE!, sort);
    const totalItems = await Product.find(query).countDocuments();
    const products = await Product.find(
      query,
      isManager ? null : { costPrice: 0, version: 0, active: 0 },
      options
    )
      .populate({
        path: 'category',
        match: { isDeleted: false },
        select: 'id name description',
      })
      .populate({
        path: 'suplier',
        match: { isDeleted: false },
        select: 'id name description',
      });
    if (!products) throw new NotFoundError('Products');
    // const convertProduct = Convert.products(products);
    return { products, totalItems };
  }
  // static convertProduct(product: ProductDoc, type: UserType) {
  //   return Convert.product(product, type);
  // }
  // static convertProducts(products: ProductDoc[], type: UserType) {
  //   return Convert.products(products, type);
  // }
  static async readOne(id: string, isManager: boolean) {
    const query = Pagination.query();
    query._id = id;
    query.isDeleted = false;
    const product = await Product.findOne(
      query,
      isManager ? null : { costPrice: 0, version: 0, active: 0 },
      null
    )
      .populate('category')
      .populate('suplier');
    if (!product) throw new NotFoundError('Product');
    const convertProduct = Convert.product(product);
    return convertProduct;
  }
  static async update(
    id: string,
    productAttrs: ProductAttrs,
    featured: boolean,
    discount: number,
    active: boolean
  ) {
    const query = Pagination.query();
    query._id = id;
    query.isDeleted = false;
    const product = await Product.findOne(query);
    if (!product) throw new NotFoundError('Product');
    const category = await Category.findCategory(productAttrs.categoryId);
    const suplier = await Suplier.findSuplier(productAttrs.suplierId);
    let imageUrl = product.imageUrl;
    if (productAttrs.file) {
      await AwsServices.deleteFile(product.imageUrl);
      Check.checkImage(productAttrs.file);
      imageUrl = await AwsServices.uploadFile(productAttrs.file);
    }
    product.set({
      name: productAttrs.name,
      description: productAttrs.description,
      category: category,
      suplier: suplier,
      imageUrl: imageUrl,
      expire: productAttrs.expire,
      costPrice: productAttrs.costPrice,
      quantity: productAttrs.quantity,
      featured: featured,
      discount: discount,
      active: active,
    });
    await product.save();
    return product;
  }
  static async disable(id: string) {
    const product = await Product.findProduct(id);
    if (!product) throw new NotFoundError('Product');
    product.set({ isDeleted: !product.isDeleted });
    await product.save();
    return product;
  }
  static async sortByCategoryOrSuplier(
    id: string,
    pages: string,
    isManager: boolean,
    name: string,
    featured: string
  ) {
    const sort = Pagination.query();
    sort.name = 1;
    if (name === 'desc') sort.name = -1;
    sort.featured = -1;
    if (featured === 'false') sort.featured = 1;
    const options = Pagination.options(pages, PER_PAGE!, sort);
    const totalItems = await Product.find({
      $and: [
        { isDeleted: false },
        { $or: [{ category: id }, { suplier: id }] },
      ],
    }).countDocuments();
    const products = await Product.find(
      {
        $and: [
          { isDeleted: false },
          { $or: [{ category: id }, { suplier: id }] },
        ],
      },
      isManager ? null : { costPrice: 0 },
      options
    )
      .populate({
        path: 'category',
        match: { isDeleted: false },
        select: 'id name description ',
      })
      .populate({
        path: 'suplier',
        match: { isDeleted: false },
        select: 'id name description ',
      });
    if (!products) throw new NotFoundError('Products');
    return { products, totalItems };
  }
  static async readAllByName(
    name: string,
    sortBy: string,
    pages: string,
    isManager: boolean
  ) {
    const query = Pagination.query();
    query.name = new RegExp(name, 'i');
    query.isDeleted = false;
    const sort = Pagination.query();
    sort.name = 1;
    if (sortBy === 'desc') sort.name = -1;
    // sort.featured = -1
    // if(featured === 'false') sort.featured = 1;
    const options = Pagination.options(pages, PER_PAGE!, sort);
    const totalItems = await Product.find(query).countDocuments();
    const products = await Product.find(
      query,
      isManager ? null : { costPrice: 0 },
      { options, sort: { featured: -1 } }
    )
      .populate({
        path: 'category',
        match: { isDeleted: false },
        select: 'id name description',
      })
      .populate({
        path: 'suplier',
        match: { isDeleted: false },
        select: 'id name description',
      })
      .exec();
    if (!products) throw new NotFoundError('Products');
    const convertProduct = Convert.products(products);
    return { products: convertProduct, totalItems };
  }
  static async readAllProductUnactive(pages: number, sortBy: string) {
    const totalItems = await Product.find({ active: false }).countDocuments();
    const products = await Product.find({ active: false })
      .sort({ createdAt: sortBy === 'asc' ? 1 : -1 })
      .skip((pages - 1) * parseInt(PER_PAGE!))
      .limit(parseInt(PER_PAGE!))
      .populate({ path: 'category', select: 'id name description' })
      .populate({ path: 'suplier', select: 'id name description' })
      .exec();
    if (!products) throw new NotFoundError('Products');
    return { products, totalItems };
  }
  static async exportData(
    workbook: exceljs.Workbook,
    worksheetName: string,
    data: ProductDoc[]
  ) {
    const sheet = workbook.addWorksheet(worksheetName);
    sheet.columns = [
      { header: 'Mã sản phẩm', key: 'code', width: 20 },
      { header: 'Tên sản phẩm', key: 'name', width: 50 },
      {
        header: 'Giá gốc',
        key: 'costPrice',
        width: 15,
      },
      {
        header: 'Giá bán',
        key: 'salePrice',
        width: 15,
      },
      {
        header: 'Mã nhà cung cấp',
        key: 'suplierCode',
        width: 25,
      },
      {
        header: 'Tên nhà cung cấp',
        key: 'suplierName',
        width: 20,
      },
      {
        header: 'Mã loại sản phẩm',
        key: 'categoryCode',
        width: 25,
      },
      {
        header: 'Tên loại sản phẩm',
        key: 'categoryName',
        width: 20,
      },
      { header: 'Hình ảnh', key: 'imageUrl', width: 50 },
      {
        header: 'Số lượng',
        key: 'quantity',
        width: 10,
      },
      { header: 'Ngày hết hạn', key: 'expire', width: 15 },
      {
        header: 'Giảm giá',
        key: 'discount',
        width: 10,
      },
      {
        header: 'Bán chạy',
        key: 'featured',
        width: 10,
      },
      { header: 'Mô tả', key: 'description', width: 50 },
      // { header: 'Đã xóa', key: 'isDeleted', width: 10 },
      { header: 'Ngày tạo', key: 'createdAt', width: 20 },
      { header: 'Phiên bản', key: 'version', width: 10 },
    ];
    data.map((value, index) => {
      // console.log(value.category.name, value.category.code);
      // console.log(value.suplier.name, value.suplier.code);

      sheet.addRow({
        code: value.code,
        name: value.name,
        costPrice: value.costPrice,
        salePrice: value.salePrice,
        suplierCode: value?.suplier?.code ?? '',
        suplierName: value?.suplier?.name ?? '',
        categoryCode: value?.category?.code ?? '',
        categoryName: value?.category?.name ?? '',
        imageUrl: value.imageUrl,
        quantity: value.quantity,
        expire: value.expire,
        discount: value.discount,
        featured: value.featured === true ? 'có' : 'không',
        description: value.description,
        // isDeleted: value.isDeleted,
        createdAt: value.createdAt,
        version: value.version,
      });
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
  static async exportProducts() {
    let workbook = new exceljs.Workbook();
    const products = await Product.find({ isDeleted: false })
      .populate('category')
      .populate('suplier');

    const workbookData = await this.exportData(workbook, 'Sản phẩm', products);
    return workbook;
  }
  static async exportProductBySuplier() {
    let workbook = new exceljs.Workbook();
    const supliers = await Suplier.find({ isDeleted: false });
    for (const sup of supliers) {
      const products = await Product.find({
        suplier: sup.id,
        isDeleted: false,
      })
        .populate('suplier')
        .populate('category');
      await this.exportData(workbook, sup.name, products);
    }
    return workbook;
  }
  static async exportProductByCategory() {
    let workbook = new exceljs.Workbook();
    const categories = await Category.find({ isDeleted: false });
    for (const category of categories) {
      const products = await Product.find({
        category: category.id,
        isDeleted: false,
      })
        .populate('suplier')
        .populate('category');
      await this.exportData(workbook, category.name, products);
    }
    return workbook;
  }
  static async getWorkSheets(file: Express.Multer.File) {
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(file.path);
    const worksheetNames: string[] = [];
    workbook.eachSheet((worksheet, sheetId) => {
      worksheetNames.push(worksheet.name);
    });
    return worksheetNames;
  }
  static async importData(file: Express.Multer.File) {
    Check.checkExcel(file);
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(file.path);
    const products: ProductDoc[] = [];
    const existProducts: ProductDoc[] = [];
    const importFaild: any[] = [];
    for (const worksheet of workbook.worksheets) {
      const rowNumber = worksheet.rowCount;
      for (let i = 2; i <= rowNumber; i++) {
        const row = worksheet.getRow(i);
        if (!row.hasValues) {
          continue;
        }
        const existProduct = await Product.findOne({
          $or: [
            { code: row.getCell(1).value as string },
            { name: row.getCell(2).value as string },
          ],
          isDeleted: false,
        });
        if (existProduct) {
          existProducts.push(existProduct);
          continue;
        }
        const category = await Category.findOne({
          code: row.getCell(7).value as string,
        });
        const suplier = await Suplier.findOne({
          code: row.getCell(5).value as string,
        });
        const product = Product.build({
          name: row.getCell(2).value as string,
          description: row.getCell(14).value as string,
          category: category!,
          suplier: suplier!,
          imageUrl: row.getCell(9).value as string,
          expire: row.getCell(11).value as Date,
          costPrice: row.getCell(3).value as number,
          quantity: row.getCell(10).value as number,
          discount: row.getCell(12).value as number,
          featured: row.getCell(13).value === 'có' ? true : false,
          code: row.getCell(1).value as string,
        });
        await product.save();
        ProductPublisher.new(product);
        products.push(product);
      }
    }
    return { products, existProducts };
  }
}
