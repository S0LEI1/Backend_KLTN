import {
  CategoryDeletedEvent,
  Listener,
  NotFoundError,
  Subjects,
} from '@share-package/common';
import { queueGroupName } from '../queueGroupName';
import { Message } from 'node-nats-streaming';
import { Category } from '../../../models/category';

export class CategoryDeletedListener extends Listener<CategoryDeletedEvent> {
  subject: Subjects.CategoryDeleted = Subjects.CategoryDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: CategoryDeletedEvent['data'], msg: Message) {
    const category = await Category.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!category) throw new NotFoundError('Category');
    category.set({ isDeleted: data.isDeleted });
    await category.save();
    msg.ack();
  }
}
