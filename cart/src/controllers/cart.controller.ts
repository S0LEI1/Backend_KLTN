import { Request, Response } from 'express';
import { CartService } from '../services/cart.service';

export class CartController {
  static async add(req: Request, res: Response) {
    const { id } = req.currentUser!;
    const { productId, quantity } = req.body;
    await CartService.add(id, productId, quantity);
    res.status(201).send({ message: 'POST: Add to cart successfully' });
  }
  static async getProductInCart(req: Request, res: Response) {
    const { id } = req.currentUser!;
    const { date } = req.query;
    const { products, totalPrice } = await CartService.getProductInCart(
      id,
      date as string
    );
    res.status(200).send({
      message: 'GET: Products in cart successfully',
      totalPrice,
      products,
    });
  }
  static async updateCart(req: Request, res: Response) {
    const { id } = req.currentUser!;
    const { cartAttr } = req.body;
    const products = await CartService.updateCart(id, cartAttr);
    res.status(200).send({
      message: 'PATCH: Update cart successfully',
      products,
    });
  }
  static async deleteProducts(req: Request, res: Response) {
    const { id } = req.currentUser!;
    const { productIds } = req.body;
    await CartService.deleteProduct(id, productIds);
    res.status(200).send({ message: 'PATCH: Delete product successfully' });
  }
}
