import {
  AccountUpdatedEvent,
  Listener,
  Subjects,
  UserType,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queue-group-name';
import { Account } from '../../../models/account';

export class AccountUpdatedListener extends Listener<AccountUpdatedEvent> {
  subject: Subjects.AccountUpdated = Subjects.AccountUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: AccountUpdatedEvent['data'], msg: Message) {
    const account = await Account.findByEvent({
      id: data.id,
      version: data.version,
    });
    account!.set({ password: data.password });
    await account!.save();
    msg.ack();
  }
}
