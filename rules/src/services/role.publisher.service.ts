import { RoleCreatedPublisher } from '../events/publishers/roles/role-created-publisher';
import { RoleDeletedPublisher } from '../events/publishers/roles/role-deleted-publisher';
import { RoleUpdatedPublisher } from '../events/publishers/roles/role-updated-publisher';
import { RoleDoc } from '../models/role';
import { natsWrapper } from '../nats-wrapper';

export class RolePublisher {
  static newRole(roleDoc: RoleDoc) {
    new RoleCreatedPublisher(natsWrapper.client).publish({
      id: roleDoc.id,
      name: roleDoc.name,
      systemName: roleDoc.systemName,
      description: roleDoc.description,
    });
  }
  static async updateRole(roleDoc: RoleDoc) {
    new RoleUpdatedPublisher(natsWrapper.client).publish({
      id: roleDoc.id,
      name: roleDoc.name,
      systemName: roleDoc.systemName,
      description: roleDoc.description,
      version: roleDoc.version,
    });
  }
  static deleteRole(role: RoleDoc) {
    new RoleDeletedPublisher(natsWrapper.client).publish({
      id: role.id,
      isDeleted: role.isDeleted!,
      version: role.version,
    });
  }
}
