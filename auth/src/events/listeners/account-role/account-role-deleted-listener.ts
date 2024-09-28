import {
  AccountRoleDeletedEvent,
  Listener,
  NotFoundError,
  Subjects,
} from '@share-package/common';
import { queueGroupName } from '../queue-group-name';
import { Message } from 'node-nats-streaming';
import { AccountRole } from '../../../models/account-role-mapping';

export class AccountRoleDeletedListener extends Listener<AccountRoleDeletedEvent> {
  subject: Subjects.AccountRoleDeleted = Subjects.AccountRoleDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: AccountRoleDeletedEvent['data'], msg: Message) {
    console.log(data);
    const accountRole = await AccountRole.findById(data.id);
    if (!accountRole) throw new NotFoundError('Account-Role');
    await AccountRole.deleteOne({ _id: accountRole.id });
    msg.ack();
  }
}
