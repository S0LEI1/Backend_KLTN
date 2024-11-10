import {
  Listener,
  NotFoundError,
  ServiceUpdatedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Service } from '../../../models/service';

export class ServiceUpdatedListener extends Listener<ServiceUpdatedEvent> {
  subject: Subjects.ServiceUpdated = Subjects.ServiceUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: ServiceUpdatedEvent['data'], msg: Message) {
    console.log(data);

    const service = await Service.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!service) throw new NotFoundError('Service');
    service.set({
      name: data.name,
      imageUrl: data.imageUrl,
      salePrice: data.salePrice,
      description: data.description,
      discount: data.discount,
      featured: data.featured,
    });
    await service.save();
    msg.ack();
  }
}
