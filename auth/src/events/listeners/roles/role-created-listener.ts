import { Listener, RoleCreatedEvent, Subjects } from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queue-group-name';
import { UserRole } from '../../../models/user-role';

export class RoleCreatedListener extends Listener<RoleCreatedEvent> {
  subject: Subjects.RoleCreated = Subjects.RoleCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: RoleCreatedEvent['data'], msg: Message) {
    const role = UserRole.build({
      id: data.id,
      name: data.name,
      description: data.description,
      active: data.active,
    });
    await role.save();
    console.log('data.id', data.id);
    console.log('role._id', role._id);
    console.log('role.id', role.id);

    msg.ack();
  }
}
