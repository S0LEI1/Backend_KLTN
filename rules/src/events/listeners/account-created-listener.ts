import {
  Listener,
  NotFoundError,
  Subjects,
  AccountCreatedEvent,
  BadRequestError,
  UserType,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queueGroupName';
import { Role } from '../../models/role';
import { GenerateUserRoleName } from '../../services/generate-user-role-name';
import { Permission, PermissionDoc } from '../../models/permission';
import { RoleCreatedPublisher } from '../publishers/roles/role-created-publisher';
import { natsWrapper } from '../../nats-wrapper';
import { RolePermission } from '../../models/role-permission';
import { RolePermissionCreatedPublisher } from '../publishers/role-permission/role-permission-created-event';
import { AccountRoleCreatedPublisher } from '../publishers/account-role/account-role-created-publisher';
import { AccountRole } from '../../models/account-role-mapping';
import { AccountRolePublisherServices } from '../../services/account-role.publisher.service';

export class AccountCreatedListenr extends Listener<AccountCreatedEvent> {
  subject: Subjects.AccountCreated = Subjects.AccountCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: AccountCreatedEvent['data'], msg: Message) {
    const role = Role.build({
      name: GenerateUserRoleName.forrmat(data.type, data.id),
      active: true,
      description: `Role of id: ${data.id}`,
    });
    await role.save();
    new RoleCreatedPublisher(natsWrapper.client).publish({
      id: role.id,
      name: role.name,
      active: true,
      description: role.description,
      version: role.version,
    });
    const accountRole = AccountRole.build({
      account: data.id,
      role: role,
    });
    await accountRole.save();
    AccountRolePublisherServices.newAccountRole(accountRole);
    let permissions: PermissionDoc[] = [];
    if (data.type === UserType.Customer) {
      permissions = await Permission.find({
        name: new RegExp('Order', 'i'),
      });
    }
    if (data.type === UserType.Employee) {
      permissions = await Permission.find({
        name: new RegExp('Shift', 'i'),
      });
    }
    for (const per of permissions) {
      const rolePer = RolePermission.build({
        permission: per,
        role: role,
      });
      await rolePer.save();
      new RolePermissionCreatedPublisher(natsWrapper.client).publish({
        id: rolePer.id,
        permissionId: rolePer.permission.id,
        roleId: rolePer.role.id,
        version: rolePer.version,
      });
    }
    msg.ack();
  }
}
