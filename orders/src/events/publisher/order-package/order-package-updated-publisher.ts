import {
  OrderPackageUpdatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class OrderPackageUpdatedPublisher extends Publisher<OrderPackageUpdatedEvent> {
  subject: Subjects.OrderPackageUpdated = Subjects.OrderPackageUpdated;
}
