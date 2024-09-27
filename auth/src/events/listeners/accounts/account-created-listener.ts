import {
  AccountCreatedEvent,
  BadRequestError,
  Listener,
  Subjects,
  UserType,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queue-group-name';
import { Account } from '../../../models/account';
import { natsWrapper } from '../../../nats-wrapper';

export class AccountCreatedListener extends Listener<AccountCreatedEvent> {
  subject: Subjects.AccountCreated = Subjects.AccountCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: AccountCreatedEvent['data'], msg: Message) {
    const account = Account.build({
      id: data.id,
      email: data.email,
      password: data.password,
      type:
        data.type === UserType.Customer
          ? UserType.Customer
          : data.type === UserType.Employee
          ? UserType.Employee
          : UserType.Manager,
    });
    await account.save();
    msg.ack();
  }
}
