import { Listener, ServiceCreatedEvent, Subjects } from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Service } from '../../../models/service';

export class ServiceCreatedListener extends Listener<ServiceCreatedEvent> {
  subject: Subjects.ServiceCreated = Subjects.ServiceCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: ServiceCreatedEvent['data'], msg: Message) {
    const service = Service.build({
      id: data.id,
      name: data.name,
      imageUrl: data.imageUrl,
      salePrice: data.salePrice,
      description: data.description,
    });
    await service.save();
    msg.ack();
  }
}
