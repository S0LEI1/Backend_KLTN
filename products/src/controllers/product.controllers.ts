import { BadRequestError, ListPermission } from '@share-package/common';
import { ProductPublisher } from '../services/product.publisher.service';
import { ProductService } from '../services/products.service';
import { Request, Response } from 'express';
import { Convert } from '../utils/convert';
import { checkImage } from '../utils/check-image';
import { ProductDoc } from '../models/product';
import { String } from 'aws-sdk/clients/apigateway';
import { Check } from '../utils/check-type';
export class ProductControllers {
  static async new(req: Request, res: Response) {
    const {
      name,
      description,
      categoryId,
      suplierId,
      expire,
      costPrice,
      quantity,
    } = req.body!;
    const { file } = req;
    const { type } = req.currentUser!;
    if (!file) throw new BadRequestError('Image must be provided');
    const product = await ProductService.new({
      name: name!,
      description: description!,
      categoryId: categoryId,
      suplierId: suplierId,
      file: file,
      expire: expire,
      costPrice: costPrice,
      quantity: quantity,
    });
    ProductPublisher.new(product!);
    const convertProduct = Convert.product(product!);
    res.status(201).send({
      message: 'POST: product create successfully',
      convertProduct,
    });
  }
  static async readAll(req: Request, res: Response) {
    const { pages = 1, active, sortBy, category, suplier } = req.query;
    let isManager = false;
    if (req.currentUser) {
      const { type, permissions } = req.currentUser;
      isManager = Check.isManager(type, permissions, [
        ListPermission.ProductRead,
      ]);
    }
    try {
      const { products, totalItems } = await ProductService.readAll(
        pages as string,
        sortBy as string,
        isManager,
        category as string,
        suplier as string
      );
      const convertProducts = Convert.products(products);
      res.status(200).send({
        message: 'GET: Products successfully',
        products: convertProducts,
        totalItems,
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async readOne(req: Request, res: Response) {
    const { id } = req.params;
    let isManager = false;
    if (req.currentUser) {
      const { type, permissions } = req.currentUser;
      isManager = Check.isManager(type, permissions, [
        ListPermission.ProductRead,
      ]);
    }
    const product = await ProductService.readOne(id, isManager);
    res.status(200).send({
      message: 'GET: product information successfully',
      product,
    });
  }
  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const {
      name,
      description,
      categoryId,
      suplierId,
      expire,
      costPrice,
      quantity,
      featured,
      discount,
      active,
    } = req.body;
    const { type } = req.currentUser!;
    const { file } = req;
    const isFeatured = featured === 'true' ? true : false;
    const isActive = active === 'true' ? true : false;
    const updateProduct = await ProductService.update(
      id,
      {
        name: name,
        description: description,
        categoryId: categoryId,
        suplierId: suplierId,
        expire: expire,
        costPrice: costPrice,
        quantity: quantity,
      },
      isFeatured,
      parseInt(discount as string),
      isActive
    );
    ProductPublisher.update(updateProduct);
    const convertProduct = Convert.product(updateProduct);
    res.status(200).send({
      message: 'PATCH: update product successfully',
      product: convertProduct,
    });
  }
  static async disable(req: Request, res: Response) {
    const { id } = req.params;
    const product = await ProductService.disable(id);
    ProductPublisher.delete(product);
    res.status(200).send({ message: 'PATCH: Disable product successfully' });
  }
  static async sortByCategoryOrSuplier(req: Request, res: Response) {
    const { id } = req.params;
    const { pages, sortBy } = req.query;
    const { type, permissions } = req.currentUser!;
    const isManager = Check.isManager(type, permissions, [
      ListPermission.ProductRead,
    ]);
    const { products, totalItems } =
      await ProductService.sortByCategoryOrSuplier(
        id,
        sortBy as string,
        pages as string,
        isManager
      );
    const convertProducts = Convert.products(products);
    res.status(200).send({
      message: 'GET: Sort by successfully',
      products: convertProducts,
      totalItems,
    });
  }
  static async readAllByName(req: Request, res: Response) {
    try {
      const { pages = 1, sortBy, name } = req.query;
      const { type, permissions } = req.currentUser!;
      const isManager = Check.isManager(type, permissions, [
        ListPermission.ProductRead,
      ]);
      const { products, totalItems } = await ProductService.readAllByName(
        name as string,
        sortBy as string,
        pages as string,
        isManager
      );
      res.status(200).json({
        message: 'GET: product by name successfully',
        products,
        totalItems,
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async readAllProductUnactive(req: Request, res: Response) {
    const { type } = req.currentUser!;
    const { pages = 1, sortBy } = req.query;
    const { products, totalItems } =
      await ProductService.readAllProductUnactive(
        parseInt(pages as string),
        sortBy as String
      );
    const convertProducts = Convert.products(products);
    res.status(200).send({
      message: 'GET: List product unactive successfully',
      products: convertProducts,
      totalItems,
    });
  }
}
