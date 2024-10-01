import {
  ProductUpdatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class ProductUpdatedPublisher extends Publisher<ProductUpdatedEvent> {
  subject: Subjects.ProductUpdated = Subjects.ProductUpdated;
}
