import {
  OrderServiceCreatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class OrderServiceCreatedPublisher extends Publisher<OrderServiceCreatedEvent> {
  subject: Subjects.OrderServiceCreated = Subjects.OrderServiceCreated;
}
