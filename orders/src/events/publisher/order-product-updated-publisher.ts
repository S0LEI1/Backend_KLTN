import {
  OrderProductUpdatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class OrderProductUpdatedPublisher extends Publisher<OrderProductUpdatedEvent> {
  subject: Subjects.OrderProductUpdated = Subjects.OrderProductUpdated;
}
