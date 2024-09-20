import {
  Listener,
  NotFoundError,
  PermissionDeletedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queue-group-name';
import { Permission } from '../../../models/permission';

export class PermissionDeletedListener extends Listener<PermissionDeletedEvent> {
  subject: Subjects.PermissionDeleted = Subjects.PermissionDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: PermissionDeletedEvent['data'], msg: Message) {
    const permission = await Permission.findByEvent(data);
    if (!permission) throw new NotFoundError('Permission');
    permission.set({ active: data.active });
    msg.ack();
  }
}
