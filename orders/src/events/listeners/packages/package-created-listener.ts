import { Listener, PackageCreatedEvent, Subjects } from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Package } from '../../../models/package';

export class PackageCreatedListener extends Listener<PackageCreatedEvent> {
  subject: Subjects.PackageCreated = Subjects.PackageCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: PackageCreatedEvent['data'], msg: Message) {
    const newPackage = Package.build({
      id: data.id,
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      salePrice: data.salePrice,
    });
    await newPackage.save();
    msg.ack();
  }
}
