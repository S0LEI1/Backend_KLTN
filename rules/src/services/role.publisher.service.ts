import { RoleDeletedPublisher } from '../events/publishers/roles/role-deleted-publisher';
import { RoleDoc } from '../models/role';
import { natsWrapper } from '../nats-wrapper';

export class RolePublisherServices {
  static deleteRole(role: RoleDoc) {
    new RoleDeletedPublisher(natsWrapper.client).publish({
      id: role.id,
      active: role.active,
      version: role.version,
    });
  }
}
