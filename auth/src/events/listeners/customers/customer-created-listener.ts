import {
  Listener,
  Subjects,
  CustomerCreatedEvent,
  UserType,
  BadRequestError,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queue-group-name';
import { User } from '../../../models/user';
import { Account } from '../../../models/account';

export class CustomerCreatedListener extends Listener<CustomerCreatedEvent> {
  subject: Subjects.CustomerCreated = Subjects.CustomerCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: CustomerCreatedEvent['data'], msg: Message) {
    const account = await Account.findOne({ email: data.email });
    if (!account) throw new BadRequestError('Email is used');
    const user = User.build({
      id: data.id,
      fullName: data.fullName,
      gender: data.gender,
      phoneNumber: data.phoneNumber,
      address: data.address,
    });
    await user.save();
    msg.ack();
  }
}
