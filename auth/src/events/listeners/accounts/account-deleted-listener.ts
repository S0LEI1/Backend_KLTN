import {
  AccountDeletedEvent,
  Listener,
  NotFoundError,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queue-group-name';
import { Account } from '../../../models/account';

export class AccountDeletedListener extends Listener<AccountDeletedEvent> {
  subject: Subjects.AccountDeleted = Subjects.AccountDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: AccountDeletedEvent['data'], msg: Message) {
    const account = await Account.findById(data.id);
    if (!account) throw new NotFoundError('Account');
    await Account.deleteOne({ _id: account.id });
    msg.ack();
  }
}
