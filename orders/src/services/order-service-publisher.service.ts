import { OrderServiceCreatedPublisher } from '../events/publisher/order-service/order-service-created-event';
import { OrderServiceDeletedPublisher } from '../events/publisher/order-service/order-service-deleted-publisher';
import { OrderServiceUpdatedPublisher } from '../events/publisher/order-service/order-service-updated-publisher';
import { OrderServiceDoc } from '../models/order-service';
import { natsWrapper } from '../nats-wrapper';

export class OrderServicePublisher {
  static async newOrderService(orderServiceDoc: OrderServiceDoc) {
    new OrderServiceCreatedPublisher(natsWrapper.client).publish({
      id: orderServiceDoc.id,
      order: orderServiceDoc.order.id,
      service: orderServiceDoc.service.id,
      quantity: orderServiceDoc.quantity,
      totalPrice: orderServiceDoc.totalPrice,
      execEmployee: orderServiceDoc.execEmployee?.id,
    });
  }
  static async newOrderServices(orderServiceDocs: OrderServiceDoc[]) {
    for (const os of orderServiceDocs) {
      this.newOrderService(os);
    }
  }

  static async updateOrderService(orderServiceDoc: OrderServiceDoc) {
    new OrderServiceUpdatedPublisher(natsWrapper.client).publish({
      id: orderServiceDoc.id,
      order: orderServiceDoc.order.id,
      service: orderServiceDoc.service.id,
      quantity: orderServiceDoc.quantity,
      totalPrice: orderServiceDoc.totalPrice,
      execEmployee: orderServiceDoc.execEmployee?.id,
      usageLogs: orderServiceDoc.usageLogs!,
      version: orderServiceDoc.version,
    });
  }
  static async deleteOrderService(orderServiceDoc: OrderServiceDoc) {
    new OrderServiceDeletedPublisher(natsWrapper.client).publish({
      id: orderServiceDoc.id,
      version: orderServiceDoc.version,
    });
  }
}
