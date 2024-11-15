import { OrderUpdatedEvent, Publisher, Subjects } from '@share-package/common';

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
  subject: Subjects.OrderUpdated = Subjects.OrderUpdated;
}
