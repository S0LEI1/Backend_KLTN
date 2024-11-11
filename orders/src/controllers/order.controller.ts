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
      pages = 1,
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
    const { type, id } = req.currentUser!;
    try {
      const { orders, totalDocuments } = await OrderService.readOrders(
        parseInt(pages as string),
        status as string,
        id as string,
        cusName as string,
        creId as string,
        creName as string,
        execId as string,
        execName as string,
        createdAt as string,
        date as string,
        type as string
      );
      res
        .status(200)
        .send({ message: 'GET: Orders successfully', orders, totalDocuments });
    } catch (error) {
      console.log(error);
    }
  }
  static async getOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const response = await OrderService.getOne(id);
      res.status(200).send({
        message: 'GET: Order successfully',
        response,
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async cancelOrder(req: Request, res: Response) {
    const { orderId } = req.params;
    const { id, type } = req.currentUser!;
    const order = await OrderService.cancelOrder(orderId, id, type);
    res
      .status(200)
      .send({ message: 'PATCH: Cancel order successfully', order });
  }
  static async findByUserPhone(req: Request, res: Response) {
    const { phoneNumber } = req.query;
    const orders = await OrderService.findByPhoneNumer(phoneNumber as string);
    res
      .status(200)
      .send({ message: 'GET: Order by customer phone successfully', orders });
  }
}
