import { CategoryCreatedPublisher } from '../events/publishers/categories/category-created-publisher';
import { CategoryDeletedPublisher } from '../events/publishers/categories/category-deleted-publisher';
import { CategoryUpdatedPublisher } from '../events/publishers/categories/category-updated-publisher';
import { CategoryDoc } from '../models/category';
import { natsWrapper } from '../nats-wrapper';

export class CategoriesPublisher {
  static new(category: CategoryDoc) {
    new CategoryCreatedPublisher(natsWrapper.client).publish({
      id: category.id,
      name: category.name,
      description: category.description,
    });
  }
  static update(category: CategoryDoc) {
    new CategoryUpdatedPublisher(natsWrapper.client).publish({
      id: category.id,
      name: category.name,
      description: category.description,
      version: category.version,
    });
  }
  static delete(category: CategoryDoc) {
    new CategoryDeletedPublisher(natsWrapper.client).publish({
      id: category.id,
      version: category.version,
      isDeleted: category.isDeleted!,
    });
  }
}
