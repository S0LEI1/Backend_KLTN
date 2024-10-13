import {
  Listener,
  Subjects,
  UserCreatedEvent,
  UserType,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '.././queueGroupName';
import { User } from '../../../models/user';

export class UserCreatedListener extends Listener<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: UserCreatedEvent['data'], msg: Message) {
    const user = User.build({
      id: data.id,
      fullName: data.fullName,
      gender: data.gender,
      phoneNumber: data.phoneNumber,
      type:
        data.type === UserType.Employee
          ? UserType.Employee
          : data.type === UserType.Customer
          ? UserType.Customer
          : UserType.Manager,
      email: data.email,
    });
    await user.save();
    msg.ack();
  }
}
