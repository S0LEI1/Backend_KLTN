import { OrderDoc } from '../models/order';
interface OrderAttrs {
  id: string;
  creEmpId: string;
  creEmpName: string;
  execEmpId?: string;
  execEmpName?: string;
  customerId: string;
  customerName: string;
  status: string;
  postTaxTotal: number;
  createdAt: string;
}
export class Convert {
  static async order(orderDoc: OrderDoc) {
    const dateConvert = orderDoc.createdAt.toLocaleDateString();
    const convert: OrderAttrs = {
      id: orderDoc.id,
      creEmpId: orderDoc.creEmp.id,
      creEmpName: orderDoc.creEmp.fullName,
      customerId: orderDoc.customer.id,
      customerName: orderDoc.customer.fullName,
      status: orderDoc.status,
      postTaxTotal: orderDoc.postTaxTotal,
      createdAt: dateConvert,
    };
    return convert;
  }
}
