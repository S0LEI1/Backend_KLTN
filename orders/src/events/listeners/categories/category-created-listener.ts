import {
  CategoryCreatedEvent,
  Listener,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Category } from '../../../models/category';

export class CategoryCreatedListener extends Listener<CategoryCreatedEvent> {
  subject: Subjects.CategoryCreated = Subjects.CategoryCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: CategoryCreatedEvent['data'], msg: Message) {
    const category = Category.build({
      id: data.id,
      name: data.name,
      description: data.description,
    });
    await category.save();
    msg.ack();
  }
}
