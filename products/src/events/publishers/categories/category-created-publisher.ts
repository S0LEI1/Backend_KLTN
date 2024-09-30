import {
  CategoryCreatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class CategoryCreatedPublisher extends Publisher<CategoryCreatedEvent> {
  subject: Subjects.CategoryCreated = Subjects.CategoryCreated;
}
