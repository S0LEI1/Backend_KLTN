import { BadRequestError } from '@share-package/common';
import { ProductPublisher } from '../services/product.publisher.service';
import { ProductService } from '../services/products.service';
import { Request, Response } from 'express';
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
    } = req.body;
    const { file } = req;
    if (!file) throw new BadRequestError('Image must be provided');
    const salePrice = costPrice + (costPrice * 10) / 100;
    const product = await ProductService.new({
      name: name,
      description: description,
      categoryId: categoryId,
      suplierId: suplierId,
      file: file!,
      expire: expire,
      costPrice: costPrice,
      salePrice: salePrice,
      quantity: quantity,
    });
    ProductPublisher.new(product!);
    res.status(201).send({
      message: 'POST: product create successfully',
      product,
    });
  }
  static async readAll(req: Request, res: Response) {
    const { pages } = req.query || 1;
    const { products, totalItems } = await ProductService.readAll(
      parseInt(pages as string)
    );
    res
      .status(200)
      .send({ message: 'GET: Products successfully', products, totalItems });
  }
}
