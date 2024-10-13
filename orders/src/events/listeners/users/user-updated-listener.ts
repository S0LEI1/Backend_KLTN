import {
  Listener,
  NotFoundError,
  Subjects,
  UserDeletedEvent,
  UserType,
  UserUpdatedEvent,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '.././queueGroupName';
import { User } from '../../../models/user';

export class UserUpdatedListener extends Listener<UserUpdatedEvent> {
  subject: Subjects.UserUpdated = Subjects.UserUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: UserUpdatedEvent['data'], msg: Message) {
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
          : data.type === UserType.Customer
          ? UserType.Customer
          : UserType.Manager,
      gender: data.gender,
      avatar: data.avatar,
      address: data.address,
    });
    await user.save();
    msg.ack();
  }
}
