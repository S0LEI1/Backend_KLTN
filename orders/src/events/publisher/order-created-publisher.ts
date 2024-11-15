import { OrderCreatedEvent, Publisher, Subjects } from '@share-package/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
