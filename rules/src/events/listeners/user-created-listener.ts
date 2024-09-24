import {
  Listener,
  NotFoundError,
  Subjects,
  UserCreatedEvent,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queueGroupName';
import { UserRole } from '../../models/user-role';
import { GenerateUserRoleName } from '../../services/generate-user-role-name';
import { Permission } from '../../models/permission';
import { RoleCreatedPublisher } from '../publishers/roles/role-created-publisher';
import { natsWrapper } from '../../nats-wrapper';
import { RolePermission } from '../../models/role-permission';
import { RolePermissionCreatedPublisher } from '../publishers/role-permission/role-permission-created-event';
import { UserURMappingCreatedPublisher } from '../publishers/user-userrole-mapping/user-urm-mapping-created-publisher';

export class UserCreatedListenr extends Listener<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: UserCreatedEvent['data'], msg: Message) {
    const userRole = UserRole.build({
      name: GenerateUserRoleName.forrmat(data.type, data.id),
      active: true,
      description: `Role of id: ${data.id}`,
    });
    await userRole.save();
    new RoleCreatedPublisher(natsWrapper.client).publish({
      id: userRole.id,
      name: userRole.name,
      active: true,
      description: userRole.description,
      version: userRole.version,
    });
    new UserURMappingCreatedPublisher(natsWrapper.client).publish({
      userId: data.id,
      roleId: userRole.id,
    });
    const permissions = await Permission.find({
      name: new RegExp('Order', 'i'),
    });
    if (!permissions) throw new NotFoundError('Permissions');
    for (const per of permissions) {
      const rolePer = RolePermission.build({
        permission: per,
        userRole: userRole,
      });
      await rolePer.save();
      new RolePermissionCreatedPublisher(natsWrapper.client).publish({
        id: rolePer.id,
        permissionId: rolePer.permission.id,
        roleId: rolePer.userRole.id,
        version: rolePer.version,
      });
    }
    msg.ack();
  }
}
