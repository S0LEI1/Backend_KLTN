import {
  Listener,
  NotFoundError,
  Subjects,
  UserDeletedEvent,
  UserType,
  UserUpdatedEvent,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queueGroupName';
import { User } from '../../models/user';

export class UserUpdatedListener extends Listener<UserUpdatedEvent> {
  subject: Subjects.UserUpdated = Subjects.UserUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: UserUpdatedEvent['data'], msg: Message) {
    if (data.type === UserType.Employee || data.type === UserType.Manager) {
      const user = await User.findUserByEvent({
        id: data.id,
        version: data.version,
      });
      if (!user) throw new NotFoundError('User');
      user.set({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        type:
          data.type === UserType.Employee
            ? UserType.Employee
            : UserType.Manager,
        gender: data.gender,
        avatar: data.avatar,
        address: data.address,
      });
      await user.save();
    }
    msg.ack();
  }
}
