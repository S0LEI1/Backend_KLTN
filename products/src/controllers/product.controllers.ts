import {
  BadRequestError,
  ListPermission,
  UserType,
} from '@share-package/common';
import { ProductPublisher } from '../services/product.publisher.service';
import { ProductService } from '../services/products.service';
import { Request, Response } from 'express';
import { Convert } from '../utils/convert';
import { checkImage } from '../utils/check-image';
import { ProductDoc } from '../models/product';
import { String } from 'aws-sdk/clients/apigateway';
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
    const convertProduct = Convert.product(product!, type);
    res.status(201).send({
      message: 'POST: product create successfully',
      convertProduct,
    });
  }
  static async readAll(req: Request, res: Response) {
    const { pages = 1, active, sortBy } = req.query;
    const { type } = req.currentUser!;
    const response = await ProductService.readAll(
      parseInt(pages as string),
      sortBy as string
    );
    const products = response.products;
    const totalItems = response.totalItems;
    const convertProducts = Convert.products(products!, type);
    res.status(200).send({
      message: 'GET: Products successfully',
      products: convertProducts,
      totalItems,
    });
  }
  static async readOne(req: Request, res: Response) {
    const { id } = req.params;
    const { type } = req.currentUser!;
    const product = await ProductService.readOne(id);
    const convertProduct = Convert.product(product, type);
    res.status(200).send({
      message: 'GET: product information successfully',
      product: convertProduct,
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
    } = req.body;
    const { type } = req.currentUser!;
    const { file } = req;
    const updateProduct = await ProductService.update(id, {
      name,
      description,
      categoryId,
      suplierId,
      expire,
      costPrice,
      quantity,
      file,
    });
    ProductPublisher.update(updateProduct);
    const convertProduct = Convert.product(updateProduct, type);
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
    const { type } = req.currentUser!;
    const { products, totalItems } =
      await ProductService.sortByCategoryOrSuplier(
        id,
        sortBy as string,
        parseInt(pages as string)
      );
    const convertProducts = Convert.products(products, type);
    res.status(200).send({
      message: 'GET: Sort by successfully',
      products: convertProducts,
      totalItems,
    });
  }
  static async readAllByName(req: Request, res: Response) {
    const { pages = 1, sortBy } = req.query;
    const { name } = req.body;
    const { type } = req.currentUser!;
    try {
      const response = await ProductService.readAllByName(
        name,
        sortBy as string,
        parseInt(pages as string)
      );
      const convertProducts = Convert.products(response.products!, type);
      res.status(200).json({
        message: 'GET: product by name successfully',
        products: convertProducts,
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
    const convertProducts = Convert.products(products, type);
    res
      .status(200)
      .send({
        message: 'GET: List product unactive successfully',
        products: convertProducts,
        totalItems,
      });
  }
}
