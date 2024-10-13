import {
  Listener,
  NotFoundError,
  ServiceDeletedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Service } from '../../../models/service';

export class ServiceDeletedListener extends Listener<ServiceDeletedEvent> {
  subject: Subjects.ServiceDeleted = Subjects.ServiceDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: ServiceDeletedEvent['data'], msg: Message) {
    const service = await Service.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!service) throw new NotFoundError('Service');
    service.set({ isDeleted: data.isDeleted });
    await service.save();
    msg.ack();
  }
}
