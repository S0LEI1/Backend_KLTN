import {
  ProductCreatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class ProductCreatedPublisher extends Publisher<ProductCreatedEvent> {
  subject: Subjects.ProductCreated = Subjects.ProductCreated;
}
