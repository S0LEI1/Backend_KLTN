import { OrderDoc } from '../models/order';
interface OrderAttrs {
  id: string;
  creatorId: string;
  creatorName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  status: string;
  preTaxTotal: number;
  tax: number;
  postTaxTotal: number;
  createdAt: Date;
}
export class Convert {
  static order(orderDoc: OrderDoc) {
    // const dateConvert = orderDoc.createdAt.toLocaleDateString();
    const convert: OrderAttrs = {
      id: orderDoc.id,
      creatorId: orderDoc.creator.id,
      creatorName: orderDoc.creator.fullName,
      customerId: orderDoc.customer.id,
      customerName: orderDoc.customer.fullName,
      customerPhone: orderDoc.customer.phoneNumber,
      status: orderDoc.status,
      preTaxTotal: orderDoc.preTaxTotal,
      tax: orderDoc.tax,
      postTaxTotal: orderDoc.postTaxTotal,
      createdAt: orderDoc.createdAt,
    };
    return convert;
  }
}
