import {
  Listener,
  NotFoundError,
  PackageDeletedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Package } from '../../../models/package';

export class PackageDeletedListener extends Listener<PackageDeletedEvent> {
  subject: Subjects.PackageDeleted = Subjects.PackageDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: PackageDeletedEvent['data'], msg: Message) {
    const existPackage = await Package.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!existPackage) throw new NotFoundError('Package');
    existPackage.set({ isDeleted: data.isDeleted });
    await existPackage.save();
    msg.ack();
  }
}
