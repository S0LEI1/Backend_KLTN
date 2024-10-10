import {
  Listener,
  NotFoundError,
  Subjects,
  UserDeletedEvent,
  UserType,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queueGroupName';
import { User } from '../../models/user';

export class UserDeletedListenr extends Listener<UserDeletedEvent> {
  subject: Subjects.UserDeleted = Subjects.UserDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: UserDeletedEvent['data'], msg: Message) {
    if (data.type === UserType.Employee || data.type === UserType.Manager) {
      const user = await User.findUserByEvent({
        id: data.id,
        version: data.version,
      });
      if (!user) throw new NotFoundError('User');
      user.set({ isDeleted: false });
      await user.save();
    }
    msg.ack();
  }
}
