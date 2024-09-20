import {
  Listener,
  PermissionCreatedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queue-group-name';
import { Permission } from '../../../models/permission';

export class PermissionCreatedListener extends Listener<PermissionCreatedEvent> {
  subject: Subjects.PermissionCreated = Subjects.PermissionCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: PermissionCreatedEvent['data'], msg: Message) {
    const permission = Permission.build({
      id: data.id,
      name: data.name,
      systemName: data.systemName,
      description: data.description,
      active: data.active,
    });
    await permission.save();
    msg.ack();
  }
}
