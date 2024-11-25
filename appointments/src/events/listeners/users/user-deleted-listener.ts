import {
  Listener,
  NotFoundError,
  Subjects,
  UserDeletedEvent,
  UserType,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '.././queueGroupName';
import { User } from '../../../models/user';

export class UserDeletedListener extends Listener<UserDeletedEvent> {
  subject: Subjects.UserDeleted = Subjects.UserDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: UserDeletedEvent['data'], msg: Message) {
    const user = await User.findUserByEvent({
      id: data.id,
      version: data.version,
    });
    if (!user) throw new NotFoundError('User');
    user.set({ isDeleted: data.isDeleted });
    await user.save();
    msg.ack();
  }
}
