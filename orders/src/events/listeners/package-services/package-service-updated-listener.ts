import {
  Listener,
  NotFoundError,
  PackageServiceUpdatedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { PackageService } from '../../../models/package-service';

export class PackageServiceUpdatedListener extends Listener<PackageServiceUpdatedEvent> {
  subject: Subjects.PackageServiceUpdated = Subjects.PackageServiceUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: PackageServiceUpdatedEvent['data'], msg: Message) {
    const packageService = await PackageService.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!packageService) throw new NotFoundError('Package-Service not found');
    packageService.set({
      service: data.serviceId,
      package: data.packageId,
      quantity: data.quantity,
    });
    await packageService.save();
    msg.ack();
  }
}
