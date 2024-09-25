// import {
//   Listener,
//   NotFoundError,
//   PermissionUpdatedEvent,
//   Subjects,
// } from '@share-package/common';
// import { Message } from 'node-nats-streaming';
// import { queueGroupName } from '../queue-group-name';
// import { Permission } from '../../../models/permission';

// export class PermissionUpdatedListener extends Listener<PermissionUpdatedEvent> {
//   subject: Subjects.PermissionUpdated = Subjects.PermissionUpdated;
//   queueGroupName: string = queueGroupName;
//   async onMessage(data: PermissionUpdatedEvent['data'], msg: Message) {
//     const permission = await Permission.findByEvent(data);
//     if (!permission) throw new NotFoundError('Permission');
//     const { name, systemName, description, active } = data;
//     permission.set({
//       name: name,
//       systemName: systemName,
//       description: description,
//       active: active,
//     });
//     await permission.save();
//     msg.ack();
//   }
// }
