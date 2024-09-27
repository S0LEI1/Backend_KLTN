import {
  Listener,
  NotFoundError,
  RolePermissionCreatedEvent,
  Subjects,
} from '@share-package/common';
import { queueGroupName } from '../queue-group-name';
import { Message } from 'node-nats-streaming';
import { RolePermission } from '../../../models/role-permission';
import { Permission } from '../../../models/permission';
import { Role } from '../../../models/role';

export class RolePermissionCreatedListener extends Listener<RolePermissionCreatedEvent> {
  subject: Subjects.RolePermissionCreated = Subjects.RolePermissionCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: RolePermissionCreatedEvent['data'], msg: Message) {
    const permission = await Permission.findById(data.permissionId);
    if (!permission) throw new NotFoundError('Permission');
    const role = await Role.findById(data.roleId);
    if (!role) throw new NotFoundError('Role');
    const rolePer = RolePermission.build({
      id: data.id,
      permission: permission,
      role: role,
    });
    await rolePer.save();
    msg.ack();
  }
}
