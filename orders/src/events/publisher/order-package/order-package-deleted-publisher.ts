import {
  OrderPackageDeletedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class OrderPackageDeletedPublisher extends Publisher<OrderPackageDeletedEvent> {
  subject: Subjects.OrderPackageDeleted = Subjects.OrderPackageDeleted;
}
