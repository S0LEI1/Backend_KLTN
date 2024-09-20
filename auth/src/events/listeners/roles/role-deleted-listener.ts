import {
  Listener,
  NotFoundError,
  RoleDeletedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queue-group-name';
import { UserRole } from '../../../models/user-role';

export class RoleDeletedListener extends Listener<RoleDeletedEvent> {
  subject: Subjects.RoleDeleted = Subjects.RoleDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: RoleDeletedEvent['data'], msg: Message) {
    console.log(data);
    const role = await UserRole.findByEvent(data);
    if (!role) throw new NotFoundError('Role');
    role.set({ active: data.active });
    await role.save();
    msg.ack();
  }
}
