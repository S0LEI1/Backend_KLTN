import {
  ProductDeletedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class ProductDeletedPublisher extends Publisher<ProductDeletedEvent> {
  subject: Subjects.ProductDeleted = Subjects.ProductDeleted;
}
