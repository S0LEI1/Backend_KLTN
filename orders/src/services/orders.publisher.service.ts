import { OrderCreatedPublisher } from '../events/publisher/order-created-publisher';
import { OrderDeletedPublisher } from '../events/publisher/order-delete-publisher';
import { OrderUpdatedPublisher } from '../events/publisher/order-updated-publihser';
import { OrderDoc } from '../models/order';
import { natsWrapper } from '../nats-wrapper';

export class OrderPublisher {
  static newOrder(orderDoc: OrderDoc) {
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: orderDoc.id,
      customer: orderDoc.customer.id,
      creEmp: orderDoc.creEmp.id,
      postTaxTotal: orderDoc.postTaxTotal,
      status: orderDoc.status,
      createdAt: orderDoc.createdAt,
    });
  }
  static updateOrder(orderDoc: OrderDoc) {
    new OrderUpdatedPublisher(natsWrapper.client).publish({
      id: orderDoc.id,
      customer: orderDoc.customer.id.toString(),
      creEmp: orderDoc.creEmp.id.toString(),
      postTaxTotal: orderDoc.postTaxTotal,
      status: orderDoc.status,
      createdAt: orderDoc.createdAt,
      version: orderDoc.version,
    });
  }
  static deleteOrder(orderDoc: OrderDoc) {
    new OrderDeletedPublisher(natsWrapper.client).publish({
      id: orderDoc.id,
      version: orderDoc.version,
      isDeleted: orderDoc.isDeleted,
    });
  }
}
