import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import { OrderServiceService } from '../services/order-service.service';
import { OrderPackageService } from '../services/order-package.service';
import { ServiceService } from '../services/service.service';

export class OrderController {
  static async newOrder(req: Request, res: Response) {
    const creEmpId = req.currentUser!.id;
    const { type } = req.currentUser!;
    const { execEmpId, customerId, services, packages, products } = req.body;
    try {
      const data = await OrderService.newOrder({
        creatorId: creEmpId,
        execEmpId: execEmpId,
        customerId: customerId,
        type: type,
        serviceAttrs: services,
        packageAttrs: packages,
        productAttrs: products,
      });
      res.status(201).send({
        message: 'POST: Order successfully',
        order: data.orderDoc,
        products: data.products,
        services: data.services,
        packages: data.packages,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async addAndDelete(req: Request, res: Response) {
    const { services, packages, products } = req.body;
    const { orderId } = req.params;
    try {
      const order = await OrderService.addAndRemove(
        orderId,
        services,
        packages,
        products
      );
      res.status(201).send({
        message: 'POST:Add successfullt',
        order: order.orderDoc,
        products: order.products,
        services: order.services,
        package: order.packages,
      });
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
      priceRange,
      phoneNumber,
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
        type as string,
        priceRange as string,
        phoneNumber as string
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
      const { order, packages, services, products, creator, customer } =
        await OrderService.getOne(id);
      res.status(200).send({
        message: 'GET: Order successfully',
        products,
        services,
        order: {
          customerId: customer.id,
          customerName: customer.fullName,
          customerPhone: customer.phoneNumber,
          creatorId: creator.id,
          creatorName: creator.fullName,
          creatorPhone: creator.phoneNumber,
          preTaxTotal: order.preTaxTotal,
          tax: order.tax,
          status: order.status,
          isDeleted: order.isDeleted,
          createdAt: order.createdAt,
          postTaxTotal: order.postTaxTotal,
          id: order.id,
        },
        packages,
        // creator: createEmp,
        // customer: customer,
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async cancelOrder(req: Request, res: Response) {
    // res.status(200).send({ message: 'message' });
    const { orderId } = req.params;
    const { id, type } = req.currentUser!;
    const order = await OrderService.cancelOrder(orderId, id, type);
    res
      .status(200)
      .send({ message: 'PATCH: Cancel order successfully', order });
  }
  // static async findByUserPhone(req: Request, res: Response) {
  //   const { key } = req.query;
  //   const orders = await OrderService.findByPhoneNumer(
  //     key as string
  //   );
  //   res
  //     .status(200)
  //     .send({ message: 'GET: Order by customer phone successfully', orders });
  // }
  static async deleteOrder(req: Request, res: Response) {
    const { orderId } = req.params;
    const order = await OrderService.deleteOrder(orderId);
    res.status(200).send({ message: 'PATCH:Delete order successfully' });
  }
  static async addUsageLog(req: Request, res: Response) {
    const { orderId, packageId, serviceId } = req.body;
    const { serviceEmebedded, count } = await OrderService.addUsageLog(
      orderId,
      packageId,
      serviceId
    );
    res
      .status(200)
      .send({ message: 'PATCH: Update successfully', serviceEmebedded, count });
  }
  static async exportPdf(req: Request, res: Response) {
    try {
      await OrderService.exportPdf().catch((err) => console.log(err));
      res.status(200).send({ message: 'message' });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async completeOrder(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const order = await OrderService.completeOrder(id);
      res
        .status(200)
        .send({ message: 'PATCH: Update order complete successfully', order });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
