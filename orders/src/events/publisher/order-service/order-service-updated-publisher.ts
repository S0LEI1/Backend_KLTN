import {
  OrderServiceUpdatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class OrderServiceUpdatedPublisher extends Publisher<OrderServiceUpdatedEvent> {
  subject: Subjects.OrderServiceUpdated = Subjects.OrderServiceUpdated;
}
