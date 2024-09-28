import {
  Listener,
  Subjects,
  AccountRoleCreatedEvent,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queue-group-name';
import { AccountRole } from '../../../models/account-role-mapping';
import { Role } from '../../../models/role';
import { Account } from '../../../models/account';

export class AccountRoleCreatedListener extends Listener<AccountRoleCreatedEvent> {
  subject: Subjects.AccountRoleCreated = Subjects.AccountRoleCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: AccountRoleCreatedEvent['data'], msg: Message) {
    const account = await Account.findAccount(data.accountId);
    const role = await Role.findRole(data.roleId);
    const accountRole = AccountRole.build({
      id: data.id,
      account: account!,
      role: role!,
    });
    await accountRole.save();
    msg.ack();
  }
}
