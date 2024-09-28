import {
  Listener,
  Subjects,
  AccountRoleCreatedEvent,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { AccountRole } from '../../models/account-role-mapping';
import { Account } from '../../models/account';
import mongoose from 'mongoose';

export class AccountRoleCreatedListener extends Listener<AccountRoleCreatedEvent> {
  subject: Subjects.AccountRoleCreated = Subjects.AccountRoleCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: AccountRoleCreatedEvent['data'], msg: Message) {
    const account = await Account.findAccount(data.accountId);
    const accountRole = AccountRole.build({
      id: data.id,
      account: account!,
      role: data.roleId,
    });
    await accountRole.save();
    msg.ack();
  }
}
