import {
  Publisher,
  CategoryUpdatedEvent,
  Subjects,
} from '@share-package/common';

export class CategoryUpdatedPublisher extends Publisher<CategoryUpdatedEvent> {
  subject: Subjects.CategoryUpdated = Subjects.CategoryUpdated;
}
