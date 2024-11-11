import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  UserType,
} from '@share-package/common';
import { User, UserDoc } from '../models/user';
import { ProductService } from './product.service';
import { ServiceService } from './service.service';
import { ProductDoc } from '../models/product';
import { ServiceDoc } from '../models/service';
import { PackageDoc } from '../models/package';
import { Order, OrderDoc } from '../models/order';
import { OrderProductService } from './order-product.service';
import { OrderServiceService } from './order-service.service';
import { OrderPackageService } from './order-package.service';
import mongoose, { FilterQuery } from 'mongoose';
import { format } from 'date-fns';
import { OrderPackage } from '../models/order-package';
import { OrderProduct } from '../models/order-product';
import { OrderServiceM } from '../models/order-service';
import { ObjectId } from 'mongoose';
const PER_PAGE = process.env.PER_PAGE;
export interface Attrs {
  id: string;
  quantity: number;
}
export class OrderService {
  static async newOrder(order: {
    creEmpId: string;
    execEmpId: string;
    customerId: string;
    type: string;
  }) {
    const createEmp = await User.findUser(order.creEmpId);
    if (!createEmp) throw new NotFoundError('Create Employee');
    if (order.type === UserType.Customer) order.customerId = order.creEmpId;
    // check execute employy
    // check customer
    const customer = await User.findUser(order.customerId);
    if (!customer) throw new NotFoundError('Customer');
    // check product, service, package must be define one
    // define previous tax price
    let orderDoc: OrderDoc;
    orderDoc = Order.build({
      customer: customer,
      creEmp: createEmp,
      status: OrderStatus.Created,
    });
    if (order.execEmpId) {
      const execEmp = await User.findUser(order.execEmpId);
      if (!execEmp) throw new NotFoundError('Execute Employee');
      orderDoc.set({
        execEmp: execEmp,
      });
    }
    await orderDoc.save();
    return orderDoc;
  }
  static async add(
    orderId: String,
    services: Attrs[],
    packages: Attrs[],
    products: Attrs[]
  ) {
    let preTaxTotal = 0;
    const orderDoc = await Order.findOne({ _id: orderId, isDeleted: false });
    if (!orderDoc) throw new NotFoundError('Order');
    if (!services && !products && !packages)
      throw new BadRequestError('Product, service, package, must be least 1');
    if (products) {
      const { orderProducts, productTotalPrice } =
        await OrderProductService.newOrderProduct(orderDoc, products);
      preTaxTotal += productTotalPrice;
    }
    if (services) {
      const { orderServices, serviceTotalPrice } =
        await OrderServiceService.newOrderService(orderDoc, services);
      preTaxTotal += serviceTotalPrice;
    }
    if (packages) {
      const { orderPackages, packageTotalPrice } =
        await OrderPackageService.newOrderPacakage(orderDoc, packages);
      preTaxTotal += packageTotalPrice;
    }
    orderDoc.set({ preTaxTotal: preTaxTotal });
    await orderDoc.save();
    return orderDoc;
  }
  static async readOrders(
    pages: number,
    status: string,
    cusId: string,
    cusName: string,
    creId: string,
    creName: string,
    execId: string,
    execName: string,
    createdAt: string,
    date: string,
    type: string
  ) {
    let filter: FilterQuery<OrderDoc> = {};
    let sort: FilterQuery<OrderDoc> = {};
    if (type === 'customer' && cusId)
      filter.customer = new mongoose.Types.ObjectId(cusId);
    if (creId) filter.creEmp = new mongoose.Types.ObjectId(creId);
    if (execId) filter.execEmp = execId;
    if (status) filter.status = status;
    if (createdAt) {
      const dateFormat = format(createdAt, 'yyyy-MM-dd');
      const convertDate = new Date(dateFormat);
      const ltDate = new Date(convertDate);
      ltDate.setDate(ltDate.getDate() + 1);
      filter.createdAt = { $gte: convertDate, $lt: ltDate };
    }
    if (date === 'asc') sort.createdAt = 1;
    if (date === 'desc') sort.createdAt = -1;
    console.log(filter);
    const totalDocuments = await Order.find().countDocuments();
    const orders = await Order.aggregate<OrderDoc>([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customer',
          foreignField: '_id',
          as: 'customer',
        },
      },
      {
        $addFields: {
          customerId: '$customer._id',
          customerName: '$customer.fullName',
        },
      },
      {
        $unwind: '$customerId',
      },
      {
        $unwind: '$customerName',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creEmp',
          foreignField: '_id',
          as: 'creEmp',
        },
      },
      {
        $addFields: {
          creEmpId: { $arrayElemAt: ['$creEmp._id', 0] },
          creEmpName: { $arrayElemAt: ['$creEmp.fullName', 0] },
        },
      },
      {
        $project: { customer: 0, creEmp: 0 },
      },
      { $skip: pages - 1 },
      { $limit: parseInt(PER_PAGE as string, 10) },
      { $sort: sort },
    ]);
    return { orders, totalDocuments };
  }
  static async getOne(id: string) {
    let filter: FilterQuery<OrderDoc> = {};
    filter._id = id;
    filter.isDeleted = false;
    const order = await Order.findOne({ _id: id, isDeleted: false });
    if (!order) throw new NotFoundError('Order');
    const createEmp = await User.findOne({
      _id: order.creEmp,
      isDeleted: false,
    });
    if (!createEmp) throw new NotFoundError('Create Employee');
    const customer = await User.findOne({
      _id: order.customer,
      isDeleted: false,
    });
    if (!customer) throw new NotFoundError('Customer');
    let execEmp: UserDoc | null;
    if (order.execEmp) {
      execEmp = await User.findOne({ _id: order.execEmp, isDeleted: false });
      if (execEmp === null) throw new NotFoundError('Execute Employee');
    }

    const orderPackages = await OrderPackageService.findByOrder(order);
    const orderProducts = await OrderProductService.findByOrderId(order);
    const orderServices = await OrderServiceService.findByOrderId(order);
    return { order, orderPackages, orderProducts, orderServices };
  }
  // static async updateOrder(order: {
  //   creEmpId: string;
  //   execEmpId: string;
  //   customerId: string;
  //   services: Attrs[];
  //   packages: Attrs[];
  //   products: Attrs[];
  //   tax: number;
  // }) {
  //   const createEmp = await User.findUser(order.creEmpId);
  //   if (!createEmp) throw new NotFoundError('Create Employee');
  //   // check execute employy
  //   // check customer
  //   const customer = await User.findUser(order.customerId);
  //   if (!customer) throw new NotFoundError('Customer');
  //   // check product, service, package must be define one
  //   if (!order.services && !order.products && !order.packages)
  //     throw new BadRequestError('Product, service, package, must be least 1');
  //   // define previous tax price
  //   let preTaxTotal = 0;
  //   let orderDoc: OrderDoc;
  //   orderDoc = Order.build({
  //     customer: customer,
  //     creEmp: createEmp,
  //     preTaxTotal: 0,
  //     tax: order.tax,
  //     status: OrderStatus.Created,
  //   });
  //   if (order.execEmpId) {
  //     const execEmp = await User.findUser(order.execEmpId);
  //     if (!execEmp) throw new NotFoundError('Execute Employee');
  //     orderDoc = Order.build({
  //       customer: customer,
  //       creEmp: createEmp,
  //       execEmp: execEmp,
  //       preTaxTotal: 0,
  //       tax: order.tax,
  //       status: OrderStatus.Created,
  //     });
  //   }
  //   if (order.products) {
  //     const { orderProducts, productTotalPrice } =
  //       await OrderProductService.newOrderProduct(orderDoc, order.products);
  //     preTaxTotal += productTotalPrice;
  //   }
  //   if (order.services) {
  //     const { orderServices, serviceTotalPrice } =
  //       await OrderServiceService.newOrderService(orderDoc, order.services);
  //     preTaxTotal += serviceTotalPrice;
  //   }
  //   if (order.packages) {
  //     const { orderPackages, packageTotalPrice } =
  //       await OrderPackageService.newOrderPacakage(orderDoc, order.packages);
  //     preTaxTotal += packageTotalPrice;
  //   }
  //   orderDoc.set({ preTaxTotal: preTaxTotal });
  //   await orderDoc.save();
  //   return orderDoc;
  // }
  static async cancelOrder(orderId: string, userId: string, type: string) {
    const order = await Order.findOne({ _id: orderId, isDeleted: false });
    if (!order) throw new NotFoundError('Order');
    if (order.status === OrderStatus.Cancelled)
      throw new BadRequestError('Order has been cancelled');
    if (order.status === OrderStatus.Complete)
      throw new BadRequestError('Order has been compeleted, cannot cancel');
    if (type === UserType.Customer)
      if (order.customer.id.toString() !== userId)
        throw new BadRequestError('You cannot cancel order');
    order.set({ status: OrderStatus.Cancelled });
    await order.save();
    return order;
  }
  static async findByPhoneNumer(phoneNumber: string) {
    const user = await User.findOne({
      phoneNumber: phoneNumber,
      isDeleted: false,
    });
    if (!user) throw new NotFoundError('Customer');
    const orders = await Order.find({
      customer: user.id,
      isDeleted: false,
    })
      .populate({
        path: 'customer',
        select: '_id fullName imageUrl phoneNumber',
      })
      .populate({
        path: 'creEmp',
        select: '_id fullName imageUrl phoneNumber',
      })
      .populate({
        path: 'execEmp',
        select: '_id fullName imageUrl phoneNumber',
      });

    return orders;
  }
}
