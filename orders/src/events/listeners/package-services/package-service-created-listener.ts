import {
  BadRequestError,
  Listener,
  NotFoundError,
  PackageServiceCreatedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Service } from '../../../models/service';
import { Package } from '../../../models/package';
import { PackageService } from '../../../models/package-service';

export class PackageServiceCreatedListener extends Listener<PackageServiceCreatedEvent> {
  subject: Subjects.PackageServiceCreated = Subjects.PackageServiceCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: PackageServiceCreatedEvent['data'], msg: Message) {
    console.log(data);

    const service = await Service.findService(data.serviceId);
    if (!service) throw new NotFoundError('Service');
    const existPackage = await Package.findPackage(data.packageId);
    if (!existPackage) throw new NotFoundError('Package');
    const packageServiceExist = await PackageService.findByServiceAndPackage(
      data.serviceId,
      data.packageId
    );
    if (packageServiceExist)
      throw new BadRequestError('Package-Seviece is exist');
    const packageService = PackageService.build({
      id: data.id,
      service: service,
      package: existPackage,
      quantity: data.quantity,
    });
    await packageService.save();
    console.log('packageService', packageService);

    msg.ack();
  }
}
