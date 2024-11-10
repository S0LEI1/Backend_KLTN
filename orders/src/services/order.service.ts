import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
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
export interface Attrs {
  id: string;
  quantity: number;
}
export class OrderService {
  static async newOrder(order: {
    creEmpId: string;
    execEmpId: string;
    customerId: string;
    services: Attrs[];
    packages: Attrs[];
    products: Attrs[];
    tax: number;
  }) {
    // const productList: ProductDoc = [];
    // const servicetList: ServiceDoc = [];
    // const packageList: PackageDoc = [];
    // check create employy
    const createEmp = await User.findUser(order.creEmpId);
    if (!createEmp) throw new NotFoundError('Create Employee');
    // check execute employy
    // check customer
    const customer = await User.findUser(order.customerId);
    if (!customer) throw new NotFoundError('Customer');
    // check product, service, package must be define one
    if (!order.services && !order.products && !order.packages)
      throw new BadRequestError('Product, service, package, must be least 1');
    // define previous tax price
    let preTaxTotal = 0;
    let orderDoc: OrderDoc;
    orderDoc = Order.build({
      customer: customer,
      creEmp: createEmp,
      preTaxTotal: 0,
      tax: order.tax,
      status: OrderStatus.Created,
    });
    if (order.execEmpId) {
      const execEmp = await User.findUser(order.execEmpId);
      if (!execEmp) throw new NotFoundError('Execute Employee');
      orderDoc = Order.build({
        customer: customer,
        creEmp: createEmp,
        execEmp: execEmp,
        preTaxTotal: 0,
        tax: order.tax,
        status: OrderStatus.Created,
      });
    }
    if (order.products) {
      const { orderProducts, productTotalPrice } =
        await OrderProductService.newOrderProduct(orderDoc, order.products);
      preTaxTotal += productTotalPrice;
    }
    if (order.services) {
      const { orderServices, serviceTotalPrice } =
        await OrderServiceService.newOrderService(orderDoc, order.services);
      preTaxTotal += serviceTotalPrice;
    }
    if (order.packages) {
      const { orderPackages, packageTotalPrice } =
        await OrderPackageService.newOrderPacakage(orderDoc, order.packages);
      preTaxTotal += packageTotalPrice;
    }
    console.log(preTaxTotal);

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
    date: string
  ) {
    let filter: FilterQuery<OrderDoc> = {};
    let sort: FilterQuery<OrderDoc> = {};
    if (creId) filter.creEmp = new mongoose.Types.ObjectId(creId);
    if (cusId) filter.customer = new mongoose.Types.ObjectId(cusId);
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

    const orders = await Order.aggregate<OrderDoc>([
      {
        $match: filter,
      },
      {
        $sort: sort,
      },
    ]);
    return orders;
  }
  static async getOne(id: string) {
    let filter: FilterQuery<OrderDoc> = {};
    filter.id = id;
    filter.isDeleted = false;
    const order = await Order.findOne(filter);
    if (!order) throw new NotFoundError('Order');
    const createEmp = await User.findOne({
      _id: order.creEmp.id,
      isDeleted: false,
    });
    if (!createEmp) throw new NotFoundError('Create Employee');
    const customer = await User.findOne({
      _id: order.customer.id,
      isDeleted: false,
    });
    if (!customer) throw new NotFoundError('Customer');
    let execEmp: UserDoc | null;
    if (order.execEmp) {
      execEmp = await User.findOne({ _id: order.execEmp.id, isDeleted: false });
      if (execEmp === null) throw new NotFoundError('Execute Employee');
    }
    const orderPackages = await OrderPackage.findByOrderId(order.id);
    let packages: PackageDoc[] = [];
    if (orderPackages !== null) {
      const packageIds = orderPackages.map((orderPkg) => orderPkg.package.id);
      console.log(packageIds);

      // packages = await OrderPackageService.getPackages(packageIds);
    }
    const orderProduct = await OrderProduct.findByOrderId(order.id);
    const orderService = await OrderServiceM.findByOrderId(order.id);
  }
}
