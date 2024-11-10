import {
  Listener,
  NotFoundError,
  PackageUpdatedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Package } from '../../../models/package';

export class PackageUpdatedListener extends Listener<PackageUpdatedEvent> {
  subject: Subjects.PackageUpdated = Subjects.PackageUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: PackageUpdatedEvent['data'], msg: Message) {
    const existPackage = await Package.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!existPackage) throw new NotFoundError('Package');
    existPackage.set({
      name: data.name,
      // costPrice: data.costPrice,
      salePrice: data.salePrice,
      imageUrl: data.imageUrl,
      discount: data.discount,
      expire: data.expire,
      count: data.count,
      featured: data.featured,
      description: data.description,
    });
  }
}
