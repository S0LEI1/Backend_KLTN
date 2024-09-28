import {
  AccountCreatedEvent,
  AccountDeletedEvent,
  Listener,
  NotFoundError,
  Subjects,
} from '@share-package/common';
import { queueGroupName } from './queueGroupName';
import { Message } from 'node-nats-streaming';
import { AccountRole } from '../../models/account-role-mapping';
import { AccountRolePublisherServices } from '../../services/account-role.publisher.service';
import { Role } from '../../models/role';
import { RolePublisherServices } from '../../services/role.publisher.service';
import { RolePermission } from '../../models/role-permission';
import { RolePermissionPublisherServices } from '../../services/role-permission.publisher.service';

export class AccountDeletedListener extends Listener<AccountDeletedEvent> {
  subject: Subjects.AccountDeleted = Subjects.AccountDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: AccountDeletedEvent['data'], msg: Message) {
    console.log(data);

    const accountRole = await AccountRole.findOne({ account: data.id });
    if (!accountRole) throw new NotFoundError('Account-Role');
    AccountRolePublisherServices.deleteAccountRole(accountRole);
    await AccountRole.deleteOne({ _id: accountRole.id });
    const role = await Role.findById(accountRole.role);
    if (!role) throw new NotFoundError('Role');
    RolePublisherServices.deleteRole(role);
    await Role.deleteOne({ _id: role.id });
    const rolePermissions = await RolePermission.find({ role: role.id });
    if (!rolePermissions) throw new NotFoundError('Role-Permission');
    for (const rolePer of rolePermissions) {
      RolePermissionPublisherServices.deleteRolePermission(rolePer);
      await RolePermission.deleteOne({ _id: rolePer.id });
    }
    msg.ack();
  }
}
