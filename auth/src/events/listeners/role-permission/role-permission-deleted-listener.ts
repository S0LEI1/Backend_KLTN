import {
  Listener,
  RolePermissionDeletedEvent,
  Subjects,
} from '@share-package/common';
import { queueGroupName } from '../queue-group-name';
import { Message } from 'node-nats-streaming';
import { RolePermission } from '../../../models/role-permission';

export class RolePermissionDeletedListener extends Listener<RolePermissionDeletedEvent> {
  subject: Subjects.RolePermissionDeleted = Subjects.RolePermissionDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: RolePermissionDeletedEvent['data'], msg: Message) {
    const rolePer = await RolePermission.findByEvent(data);
    await RolePermission.deleteOne({ _id: rolePer!._id });
    msg.ack();
  }
}
