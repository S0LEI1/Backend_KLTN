import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';

export class OrderController {
  static async newOrder(req: Request, res: Response) {
    const creEmpId = req.currentUser!.id;
    const { execEmpId, customerId, services, packages, products, tax } =
      req.body;
    try {
      const order = await OrderService.newOrder({
        creEmpId: creEmpId,
        execEmpId: execEmpId,
        customerId: customerId,
        services: services,
        packages: packages,
        products: products,
        tax: tax,
      });
      res.status(201).send({ message: 'POST: Order successfully', order });
    } catch (error) {
      console.log(error);
    }
  }
  static async readOrders(req: Request, res: Response) {
    const {
      pages,
      status,
      cusName,
      creName,
      execName,
      createdAt,
      cusId,
      creId,
      execId,
      date,
    } = req.query;
    const orders = await OrderService.readOrders(
      parseInt(pages as string),
      status as string,
      cusId as string,
      cusName as string,
      creId as string,
      creName as string,
      execId as string,
      execName as string,
      createdAt as string,
      date as string
    );
    res.status(200).send({ message: 'GET: Orders successfully', orders });
  }
  static async readOne(req: Request, res: Response) {
    const { id } = req.params;
    res.status(200).send({ message: 'GET: Order successfully' });
  }
}
