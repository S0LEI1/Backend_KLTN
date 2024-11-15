import { OrderDeletedEvent, Publisher, Subjects } from '@share-package/common';

export class OrderDeletedPublisher extends Publisher<OrderDeletedEvent> {
  subject: Subjects.OrderDeleted = Subjects.OrderDeleted;
}
