import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  Pagination,
  UserType,
} from '@share-package/common';
import { User, UserDoc } from '../models/user';
import { Order, OrderDoc } from '../models/order';
import { OrderProductService, ProductInOrder } from './order-product.service';
import { OrderServiceService, ServiceInOrder } from './order-service.service';
import { OrderPackageService, PackageInOrder } from './order-package.service';
import mongoose, { FilterQuery } from 'mongoose';
import { format } from 'date-fns';
import { OrderPublisher } from './orders.publisher.service';
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
    OrderPublisher.newOrder(orderDoc);
    return orderDoc;
  }
  static async addAndRemove(
    orderId: String,
    serviceAttrs: Attrs[],
    packageAttrs: Attrs[],
    productAttrs: Attrs[]
  ) {
    const orderDoc = await Order.findOne({ _id: orderId, isDeleted: false });
    if (!orderDoc) throw new NotFoundError('Order');
    let preTaxTotal = orderDoc.preTaxTotal | 0;
    if (!serviceAttrs && !productAttrs && !packageAttrs)
      throw new BadRequestError('Product, service, package, must be least 1');
    let products: ProductInOrder[] = [];
    if (productAttrs) {
      const { orderProducts, productTotalPrice, productsInPackage } =
        await OrderProductService.newOrderProducts(orderDoc, productAttrs);
      preTaxTotal += productTotalPrice;
      products = productsInPackage;
    }
    let services: ServiceInOrder[] = [];
    if (serviceAttrs) {
      const { orderServices, serviceTotalPrice, servicesInPackage } =
        await OrderServiceService.newOrderServices(orderDoc, serviceAttrs);
      preTaxTotal += serviceTotalPrice;
      services = servicesInPackage;
    }
    let packages: PackageInOrder[] = [];
    if (packageAttrs) {
      const { orderPackages, packageTotalPrice, packagesInOrder } =
        await OrderPackageService.newOrderPacakages(orderDoc, packageAttrs);
      preTaxTotal += packageTotalPrice;
      packages = packagesInOrder;
    }
    orderDoc.set({ preTaxTotal: preTaxTotal });
    await orderDoc.save();
    OrderPublisher.updateOrder(orderDoc);
    return { orderDoc, products, services, packages };
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
      { $limit: parseInt(PER_PAGE as string, 25) },
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
    const createEmp = await User.findOne(
      {
        _id: order.creEmp,
        isDeleted: false,
      },
      { id: 1, fullName: 1, imageUrl: 1, phoneNumber: 1, type: 1 }
    );
    if (!createEmp) throw new NotFoundError('Create Employee');
    const customer = await User.findOne(
      {
        _id: order.customer,
        isDeleted: false,
      },
      { id: 1, fullName: 1, imageUrl: 1, phoneNumber: 1, type: 1 }
    );
    if (!customer) throw new NotFoundError('Customer');
    let execEmp: UserDoc | null;
    if (order.execEmp) {
      execEmp = await User.findOne(
        { _id: order.execEmp, isDeleted: false },
        { id: 1, fullName: 1, imageUrl: 1, phoneNumber: 1, type: 1 }
      );
      if (execEmp === null) throw new NotFoundError('Execute Employee');
    }

    const packages = await OrderPackageService.findByOrder(order);
    const products = await OrderProductService.findByOrder(order);
    const services = await OrderServiceService.findByOrder(order);
    return { order, createEmp, customer, packages, services, products };
  }

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
    OrderPublisher.updateOrder(order);
    return order;
  }
  static async findByPhoneNumer(phoneNumber: string, name: string) {
    let filter = Pagination.query();
    filter.isDeleted = false;
    if (phoneNumber) filter.phoneNumber = phoneNumber;
    if (name) filter = { ...filter, fullName: RegExp(name, 'i') };
    const user = await User.findOne(filter);
    if (!user) throw new NotFoundError('Customer');
    console.log(filter);

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
  static async deleteOrder(orderId: string) {
    const order = await Order.findOne({ _id: orderId, isDeleted: false });
    if (!order) throw new NotFoundError('Order');
    order.set({ isDeleted: false });
    await order.save();
    OrderPublisher.deleteOrder(order);
    return order;
  }
}
