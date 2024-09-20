import {
  Listener,
  NotFoundError,
  RoleUpdatedEvent,
  Subjects,
} from '@share-package/common';
import { queueGroupName } from '../queue-group-name';
import { Message } from 'node-nats-streaming';
import { UserRole } from '../../../models/user-role';

export class RoleUpdatedListener extends Listener<RoleUpdatedEvent> {
  subject: Subjects.RoleUpdated = Subjects.RoleUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: RoleUpdatedEvent['data'], msg: Message) {
    console.log(data);

    const role = await UserRole.findByEvent(data);
    console.log(role);

    if (role === null) throw new NotFoundError('Role');
    role.set({
      name: data.name,
      description: data.description,
    });
    await role.save();
    msg.ack();
  }
}
