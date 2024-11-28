import { Request, Response } from 'express';
import { CartServices } from '../services/cart.service';

export class CartController {
  static async add(req: Request, res: Response) {
    const { id } = req.currentUser!;
    const { item, type } = req.body;
    const addItem = await CartServices.add(id, item, type);
    res
      .status(201)
      .send({ message: 'POST: Add to cart successfully', addItem });
  }
  static async getProductInCart(req: Request, res: Response) {
    const { id } = req.currentUser!;
    const { date, type } = req.query;
    try {
      const { itemsInCart, totalPrice, totalQuantity } =
        await CartServices.getItemsInCart(id, date as string, type as string);
      res.status(200).send({
        message: 'GET: Products in cart successfully',
        itemsInCart,
        totalPrice,
        totalQuantity,
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async updateCart(req: Request, res: Response) {
    const { id } = req.currentUser!;
    const { cartAttr } = req.body;
    const itemsInCart = await CartServices.updateCart(id, cartAttr);
    res.status(200).send({
      message: 'PATCH: Update cart successfully',
      itemsInCart,
    });
  }
  static async deleteItems(req: Request, res: Response) {
    const { id } = req.currentUser!;
    const { ids } = req.body;
    await CartServices.deleteItems(id, ids);
    res.status(200).send({ message: 'PATCH: Delete product successfully' });
  }
}
