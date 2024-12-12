import {
  CategoryUpdatedEvent,
  Listener,
  NotFoundError,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Category } from '../../../models/category';

export class CategoryUpdatedListener extends Listener<CategoryUpdatedEvent> {
  subject: Subjects.CategoryUpdated = Subjects.CategoryUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: CategoryUpdatedEvent['data'], msg: Message) {
    const category = await Category.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!category) throw new NotFoundError('Category');
    category.set({
      name: data.name,
      description: data.description,
    });
    await category.save();
    console.log('Message received' + Subjects.CategoryUpdated + 'done');
    msg.ack();
  }
}
