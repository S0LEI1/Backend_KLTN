import { AccountRoleCreatedPublisher } from '../events/publishers/account-role/account-role-created-publisher';
import { AccountRoleDeletedPublisher } from '../events/publishers/account-role/account-role-deleted-publisher';
import { AccountRoleDoc } from '../models/account-role-mapping';
import { natsWrapper } from '../nats-wrapper';

export class AccountRolePublisherServices {
  static newAccountRole(accountRole: AccountRoleDoc) {
    new AccountRoleCreatedPublisher(natsWrapper.client).publish({
      id: accountRole.id,
      accountId: accountRole.account,
      roleId: accountRole.role.id,
    });
  }
  static deleteAccountRole(accountRole: AccountRoleDoc) {
    new AccountRoleDeletedPublisher(natsWrapper.client).publish({
      id: accountRole.id,
      version: accountRole.version,
    });
  }
}
