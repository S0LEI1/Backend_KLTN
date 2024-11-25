import {
  OrderServiceDeletedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class OrderServiceDeletedPublisher extends Publisher<OrderServiceDeletedEvent> {
  subject: Subjects.OrderServiceDeleted = Subjects.OrderServiceDeleted;
}
