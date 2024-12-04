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
import { OrderPackage } from '../models/order-package';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { OrderServiceM, UsageLog } from '../models/order-service';
import { writeFileSync } from 'fs';

const PER_PAGE = process.env.PER_PAGE;
export interface Attrs {
  id: string;
  quantity: number;
}
interface ServiceEmebeddedLog {
  serviceId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  usageLogs: UsageLog[];
}
export class OrderService {
  static async newOrder(order: {
    creatorId: string;
    execEmpId: string;
    customerId: string;
    type: string;
  }) {
    const creator = await User.findUser(order.creatorId);
    if (!creator) throw new NotFoundError('Create Employee');
    if (order.type === UserType.Customer) order.customerId = order.creatorId;
    // check execute employy
    // check customer
    const customer = await User.findUser(order.customerId);
    if (!customer) throw new NotFoundError('Customer');
    // check product, service, package must be define one
    // define previous tax price
    let orderDoc: OrderDoc;
    orderDoc = Order.build({
      creator: creator,
      customer: customer,
      status: OrderStatus.Created,
    });
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
    const orderDoc = await Order.findOne<OrderDoc>({
      _id: orderId,
      isDeleted: false,
    })
      .populate('customer')
      .populate('creator');

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
    // console.log(orderDoc);

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
    type: string,
    priceRange: string,
    phoneNumber: string
  ) {
    let filter: FilterQuery<OrderDoc> = {};
    let phone: FilterQuery<OrderDoc> = {};
    let sort: FilterQuery<OrderDoc> = {};
    if (type === 'customer' && cusId)
      filter.customer = new mongoose.Types.ObjectId(cusId);
    if (creId) filter.creator = new mongoose.Types.ObjectId(creId);
    if (execId) filter.execEmp = execId;
    if (status) filter.status = status;
    if (phoneNumber) filter.customerPhone = phoneNumber;
    if (createdAt) {
      const dateFormat = format(createdAt, 'yyyy-MM-dd');
      const convertDate = new Date(dateFormat);
      const ltDate = new Date(convertDate);
      ltDate.setDate(ltDate.getDate() + 1);
      filter.createdAt = { $gte: convertDate, $lt: ltDate };
    }
    // if (phone) phone.customer['phoneNumber'] = { customerPhone: phoneNumber };
    const highPrice = 3000000;
    const lowPrice = 500000;
    if (priceRange === 'highprice') filter.postTaxTotal = { $gt: highPrice };
    if (priceRange === 'lowprice') filter.postTaxTotal = { $lt: lowPrice };
    if (priceRange === 'mediumprice')
      filter.postTaxTotal = { $gte: lowPrice, $lte: highPrice };
    if (date === 'asc') sort.createdAt = 1;
    if (date === 'desc') sort.createdAt = -1;
    console.log(filter);
    // const totalDocuments = await Order.aggregate([
    //   {
    //     $lookup: {
    //       from: 'users',
    //       localField: 'customer',
    //       foreignField: '_id',
    //       as: 'customer',
    //     },
    //   },
    //   {
    //     $addFields: {
    //       customerId: '$customer._id',
    //       customerName: '$customer.fullName',
    //       customerPhone: '$customer.phoneNumber',
    //     },
    //   },
    //   {
    //     $unwind: '$customerId',
    //   },
    //   {
    //     $unwind: '$customerName',
    //   },
    //   {
    //     $unwind: '$customerPhone',
    //   },
    //   {
    //     $match: filter,
    //   },
    //   { $match: filter },
    //   { $count: 'totalDocuments' },
    // ]);
    const orders = await Order.aggregate<OrderDoc>([
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
          customerPhone: '$customer.phoneNumber',
        },
      },
      {
        $unwind: '$customerId',
      },
      {
        $unwind: '$customerName',
      },
      {
        $unwind: '$customerPhone',
      },
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creator',
        },
      },
      {
        $addFields: {
          creatorId: { $arrayElemAt: ['$creator._id', 0] },
          creatorName: { $arrayElemAt: ['$creator.fullName', 0] },
        },
      },
      {
        $project: { customer: 0, creator: 0 },
      },
      { $skip: pages - 1 },
      { $limit: parseInt(PER_PAGE as string, 25) },
      { $sort: sort },
    ]);
    return { orders, totalDocuments: orders.length };
  }
  static async getOne(id: string) {
    let filter: FilterQuery<OrderDoc> = {};
    filter._id = id;
    filter.isDeleted = false;
    const order = await Order.findOne({ _id: id, isDeleted: false });
    if (!order) throw new NotFoundError('Order');
    const creator = await User.findOne(
      {
        _id: order.creator,
        isDeleted: false,
      },
      { id: 1, fullName: 1, imageUrl: 1, phoneNumber: 1, type: 1 }
    );
    if (!creator) throw new NotFoundError('Create Employee');
    const customer = await User.findOne(
      {
        _id: order.customer,
        isDeleted: false,
      },
      { id: 1, fullName: 1, imageUrl: 1, phoneNumber: 1, type: 1 }
    );
    if (!customer) throw new NotFoundError('Customer');
    const packages = await OrderPackageService.findByOrder(order);
    const products = await OrderProductService.findByOrder(order);
    const services = await OrderServiceService.findByOrder(order);
    return { order, creator, customer, packages, services, products };
  }

  static async cancelOrder(orderId: string, userId: string, type: string) {
    const order = await Order.findOne({ _id: orderId, isDeleted: false })
      .populate('customer')
      .populate('creator');
    if (!order) throw new NotFoundError('Order');
    if (order.status === OrderStatus.Cancelled)
      throw new BadRequestError('Order has been cancelled');
    if (order.status === OrderStatus.Complete)
      throw new BadRequestError('Order has been compeleted, cannot cancel');
    if (type === UserType.Customer)
      if (order.customer.id !== userId)
        throw new BadRequestError('You cannot cancel order');
    order.set({ status: OrderStatus.Cancelled });
    await order.save();
    OrderPublisher.updateOrder(order);
    return order;
  }
  // static async findByPhoneNumer(key: string, pages: string) {
  //   let filter = Pagination.query();
  //   filter.isDeleted = false;
  //   filter = {$or:[{phoneNumber: key},{ fullName: RegExp(key, 'i')}]}
  //   const user = await User.findOne(filter);
  //   if (!user) throw new NotFoundError('Customer');
  //   const orders = await Order.aggregate<OrderDoc>([
  //     {
  //       $match: filter,
  //     },
  //     {
  //       $lookup: {
  //         from: 'users',
  //         localField: 'customer',
  //         foreignField: '_id',
  //         as: 'customer',
  //       },
  //     },
  //     {
  //       $addFields: {
  //         customerId: '$customer._id',
  //         customerName: '$customer.fullName',
  //         customerPhone: '$customer.phoneNumber',
  //       },
  //     },
  //     {
  //       $unwind: '$customerId',
  //     },
  //     {
  //       $unwind: '$customerName',
  //     },
  //     {
  //       $unwind: '$customerPhone',
  //     },
  //     {
  //       $lookup: {
  //         from: 'users',
  //         localField: 'creator',
  //         foreignField: '_id',
  //         as: 'creator',
  //       },
  //     },
  //     {
  //       $addFields: {
  //         creatorId: { $arrayElemAt: ['$creator._id', 0] },
  //         creatorName: { $arrayElemAt: ['$creator.fullName', 0] },
  //       },
  //     },
  //     {
  //       $project: { customer: 0, creator: 0 },
  //     },
  //     { $skip: pages - 1 },
  //     { $limit: parseInt(PER_PAGE as string, 25) },
  //     { $sort: sort },
  //   ]);
  //   return orders;
  // }
  static async deleteOrder(orderId: string) {
    const order = await Order.findOne({ _id: orderId, isDeleted: false });
    if (!order) throw new NotFoundError('Order');
    order.set({ isDeleted: false });
    await order.save();
    OrderPublisher.deleteOrder(order);
    return order;
  }
  static async updateServiceInOrderPackage(orderId: string, serviceId: string) {
    const order = await Order.findOne({ _id: orderId, isDeleted: false });
    if (!order) throw new NotFoundError('Order');
    const orderPkg = await OrderPackage.findOne({
      order: order.id,
      isDeleted: false,
    });
    if (!orderPkg) throw new NotFoundError('Order-Package');
    const { serviceEmbedded } = orderPkg;
    const service = serviceEmbedded.filter(
      (service) => service.service.id === serviceId
    );
    if (!service) throw new BadRequestError('Service not exist in package');
    const date = new Date();
    const orderPackage = await OrderPackage.findOne({
      order: orderId,
      'serviceEmbedded.service': serviceId,
    });
    await OrderPackage.updateOne(
      { order: orderId, 'serviceEmbedded.service': serviceId },
      {
        $set: {
          'serviceEmbedded.$.status': true,
          'serviceEmbedded.$.date': date,
        },
      }
    );
  }
  static async exportPdf() {
    const document = await PDFDocument.create();

    const page = document.addPage([300, 400]);

    const text = 'Hello World';
    const helveticaFont = await document.embedFont(StandardFonts.Helvetica);
    const textWidth = helveticaFont.widthOfTextAtSize(text, 24);
    const textHeight = helveticaFont.heightAtSize(24);

    page.drawText(text, {
      x: page.getWidth() / 2 - textWidth / 2,
      y: page.getHeight() / 2 - textHeight / 2,
    });

    writeFileSync('hello.pdf', await document.save());
  }
  static async addUsageLog(
    orderId: string,
    packageId: string,
    serviceId: string
  ) {
    console.log(packageId);
    console.log(serviceId);

    if (packageId) {
      const { serviceEmbeddedUpdate, count } =
        await OrderPackageService.addUsageLog(orderId, packageId, serviceId);
      const serviceEmebedded: ServiceEmebeddedLog = {
        serviceId: serviceEmbeddedUpdate.service.id,
        name: serviceEmbeddedUpdate.service.name,
        imageUrl: serviceEmbeddedUpdate.service.imageUrl,
        quantity: serviceEmbeddedUpdate.quantity,
        usageLogs: serviceEmbeddedUpdate.usageLogs!,
      };
      return { serviceEmebedded, count };
    }
    const { orderService, count } = await OrderServiceService.addUsageLog(
      orderId,
      serviceId
    );
    const serviceEmebedded: ServiceEmebeddedLog = {
      serviceId: orderService.service.id,
      name: orderService.service.name,
      imageUrl: orderService.service.imageUrl,
      quantity: orderService.quantity,
      usageLogs: orderService.usageLogs!,
    };
    return { serviceEmebedded, count };
    // return {"Not found", 0};
  }
  static async completeOrder(orderId: string) {
    const order = await Order.findOrder(orderId);
    if (!order) throw new NotFoundError('Order');
    if (order.status === OrderStatus.Cancelled)
      throw new BadRequestError('Cannot pay for an cancelled order');
    if (order.status === OrderStatus.Complete)
      throw new BadRequestError('Cannot pay for an complete order');
    order.set({ status: OrderStatus.Complete });
    await order.save();
    OrderPublisher.updateOrder(order);
    return order;
  }
}
