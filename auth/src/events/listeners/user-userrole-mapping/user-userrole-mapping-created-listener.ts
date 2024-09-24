import {
  Listener,
  Subjects,
  UserURMappingCreatedEvent,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queue-group-name';
import { UserURMapping } from '../../../models/user-ur-mapping';
import { User } from '../../../models/user';
import { UserRole } from '../../../models/user-role';

export class UserURMappingCreatedListener extends Listener<UserURMappingCreatedEvent> {
  subject: Subjects.UserURMCreated = Subjects.UserURMCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: UserURMappingCreatedEvent['data'], msg: Message) {
    const user = await User.findUser(data.userId);
    const userRole = await UserRole.findUserRole(data.roleId);
    const userURM = UserURMapping.build({
      user: user!,
      userRole: userRole!,
    });
    await userURM.save();
    msg.ack();
  }
}
