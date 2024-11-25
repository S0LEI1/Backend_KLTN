import {
  OrderPackageCreatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class OrderPackageCreatedPublisher extends Publisher<OrderPackageCreatedEvent> {
  subject: Subjects.OrderPackageCreated = Subjects.OrderPackageCreated;
}
