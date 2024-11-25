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
import { PDFDocument } from 'pdf-lib';

const PER_PAGE = process.env.PER_PAGE;
export interface Attrs {
  id: string;
  quantity: number;
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
    type: string
  ) {
    let filter: FilterQuery<OrderDoc> = {};
    let sort: FilterQuery<OrderDoc> = {};
    if (type === 'customer' && cusId)
      filter.customer = new mongoose.Types.ObjectId(cusId);
    if (creId) filter.creator = new mongoose.Types.ObjectId(creId);
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
    return { orders, totalDocuments };
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
        path: 'creator',
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
  static async exportPDF() {
    const pdfDoc = await PDFDocument.create();

    // Add a blank page to the document
    const page = pdfDoc.addPage([550, 750]);

    // Get the form so we can add fields to it
    const form = pdfDoc.getForm();

    // Add the superhero text field and description
    page.drawText('Enter your favorite superhero:', {
      x: 50,
      y: 700,
      size: 20,
    });

    const superheroField = form.createTextField('favorite.superhero');
    superheroField.setText('One Punch Man');
    superheroField.addToPage(page, { x: 55, y: 640 });

    // Add the rocket radio group, labels, and description
    page.drawText('Select your favorite rocket:', { x: 50, y: 600, size: 20 });

    page.drawText('Falcon Heavy', { x: 120, y: 560, size: 18 });
    page.drawText('Saturn IV', { x: 120, y: 500, size: 18 });
    page.drawText('Delta IV Heavy', { x: 340, y: 560, size: 18 });
    page.drawText('Space Launch System', { x: 340, y: 500, size: 18 });

    const rocketField = form.createRadioGroup('favorite.rocket');
    rocketField.addOptionToPage('Falcon Heavy', page, { x: 55, y: 540 });
    rocketField.addOptionToPage('Saturn IV', page, { x: 55, y: 480 });
    rocketField.addOptionToPage('Delta IV Heavy', page, { x: 275, y: 540 });
    rocketField.addOptionToPage('Space Launch System', page, {
      x: 275,
      y: 480,
    });
    rocketField.select('Saturn IV');

    // Add the gundam check boxes, labels, and description
    page.drawText('Select your favorite gundams:', { x: 50, y: 440, size: 20 });

    page.drawText('Exia', { x: 120, y: 400, size: 18 });
    page.drawText('Kyrios', { x: 120, y: 340, size: 18 });
    page.drawText('Virtue', { x: 340, y: 400, size: 18 });
    page.drawText('Dynames', { x: 340, y: 340, size: 18 });

    const exiaField = form.createCheckBox('gundam.exia');
    const kyriosField = form.createCheckBox('gundam.kyrios');
    const virtueField = form.createCheckBox('gundam.virtue');
    const dynamesField = form.createCheckBox('gundam.dynames');

    exiaField.addToPage(page, { x: 55, y: 380 });
    kyriosField.addToPage(page, { x: 55, y: 320 });
    virtueField.addToPage(page, { x: 275, y: 380 });
    dynamesField.addToPage(page, { x: 275, y: 320 });

    exiaField.check();
    dynamesField.check();

    // Add the planet dropdown and description
    page.drawText('Select your favorite planet*:', { x: 50, y: 280, size: 20 });

    const planetsField = form.createDropdown('favorite.planet');
    planetsField.addOptions(['Venus', 'Earth', 'Mars', 'Pluto']);
    planetsField.select('Pluto');
    planetsField.addToPage(page, { x: 55, y: 220 });

    // Add the person option list and description
    page.drawText('Select your favorite person:', { x: 50, y: 180, size: 18 });

    const personField = form.createOptionList('favorite.person');
    personField.addOptions([
      'Julius Caesar',
      'Ada Lovelace',
      'Cleopatra',
      'Aaron Burr',
      'Mark Antony',
    ]);
    personField.select('Ada Lovelace');
    personField.addToPage(page, { x: 55, y: 70 });

    // Just saying...
    page.drawText(`* Pluto should be a planet too!`, {
      x: 15,
      y: 15,
      size: 15,
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}
