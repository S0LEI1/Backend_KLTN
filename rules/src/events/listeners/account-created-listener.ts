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
import { Role, RoleDoc } from '../../models/role';
import { Permission, PermissionDoc } from '../../models/permission';
import { RoleCreatedPublisher } from '../publishers/roles/role-created-publisher';
import { natsWrapper } from '../../nats-wrapper';
import { RolePermission } from '../../models/role-permission';
import { RolePermissionCreatedPublisher } from '../publishers/role-permission/role-permission-created-event';
import { AccountRoleCreatedPublisher } from '../publishers/account-role/account-role-created-publisher';
import { AccountRole } from '../../models/account-role-mapping';
import { AccountRolePublisherServices } from '../../services/account-role.publisher.service';
import { RoleServices } from '../../services/roles.service';

export class AccountCreatedListenr extends Listener<AccountCreatedEvent> {
  subject: Subjects.AccountCreated = Subjects.AccountCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: AccountCreatedEvent['data'], msg: Message) {
    let role: RoleDoc;
    if (data.type === UserType.Customer) {
      const existRole = await Role.findOne({ systemName: 'order.manage' });
      if (!existRole) {
        const newRole = await RoleServices.newRole(
          'Quản lý hóa đơn',
          'Người dùng có thể xem, tạo, xóa, sửa hóa đơn',
          'shift.manage'
        );
        role = newRole;
      }
      role = existRole!;
    }
    if (data.type === UserType.Employee) {
      const existRole = await Role.findOne({ systemName: 'shift.manage' });
      if (!existRole) {
        const newRole = await RoleServices.newRole(
          'Quản lý ca làm việc',
          'Người dùng có thể xem, tạo, xóa, sửa ca làm việc',
          'order.manage'
        );
        role = newRole;
      }
      role = existRole!;
    }
    const newAccountRole = AccountRole.build({
      account: data.id,
      role: role!,
    });
    await newAccountRole.save();
    AccountRolePublisherServices.newAccountRole(newAccountRole);
    msg.ack();
  }
}
