import {
  CategoryDeletedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class CategoryDeletedPublisher extends Publisher<CategoryDeletedEvent> {
  subject: Subjects.CategoryDeleted = Subjects.CategoryDeleted;
}
