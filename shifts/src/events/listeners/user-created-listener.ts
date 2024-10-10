import {
  Listener,
  Subjects,
  UserCreatedEvent,
  UserType,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queueGroupName';
import { User } from '../../models/user';

export class UserCreatedListener extends Listener<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: UserCreatedEvent['data'], msg: Message) {
    if (data.type === UserType.Employee || data.type === UserType.Manager) {
      const user = User.build({
        id: data.id,
        fullName: data.fullName,
        gender: data.gender,
        phoneNumber: data.phoneNumber,
        type:
          data.type === UserType.Employee
            ? UserType.Employee
            : UserType.Manager,
      });
      await user.save();
    }
    msg.ack();
  }
}
