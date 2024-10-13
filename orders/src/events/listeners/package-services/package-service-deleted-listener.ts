import {
  Listener,
  NotFoundError,
  PackageServiceDeletedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { PackageService } from '../../../models/package-service';

export class PacakgeServiceDeletedListener extends Listener<PackageServiceDeletedEvent> {
  subject: Subjects.PackageServiceDeleted = Subjects.PackageServiceDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: PackageServiceDeletedEvent['data'], msg: Message) {
    console.log(data);

    const packageService = await PackageService.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!packageService) throw new NotFoundError('Package-Service');
    await PackageService.deleteOne({ _id: packageService.id });
    msg.ack();
  }
}
