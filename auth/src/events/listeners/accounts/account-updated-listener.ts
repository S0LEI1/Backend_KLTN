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
    console.log('data', data);

    try {
      const account = await Account.findByEvent({
        id: data.id,
        version: data.version,
      });
      console.log(account);

      account!.set({ password: data.password });
      await account!.save();
      console.log('account after', account);
      msg.ack();
    } catch (error) {
      console.log(error);
    }
  }
}
