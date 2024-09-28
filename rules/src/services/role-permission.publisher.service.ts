import { RolePermissionDeletedPublisher } from '../events/publishers/role-permission/role-permission-deleted-publisher';
import { RolePermissionDoc } from '../models/role-permission';
import { natsWrapper } from '../nats-wrapper';

export class RolePermissionPublisherServices {
  static deleteRolePermission(rolePermission: RolePermissionDoc) {
    new RolePermissionDeletedPublisher(natsWrapper.client).publish({
      id: rolePermission.id,
      version: rolePermission.version,
    });
  }
}
