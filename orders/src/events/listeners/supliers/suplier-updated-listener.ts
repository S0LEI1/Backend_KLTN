import {
  Listener,
  NotFoundError,
  Subjects,
  SuplierUpdatedEvent,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Suplier } from '../../../models/suplier';

export class SuplierUpdatedListener extends Listener<SuplierUpdatedEvent> {
  subject: Subjects.SuplierUpdated = Subjects.SuplierUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: SuplierUpdatedEvent['data'], msg: Message) {
    const suplier = await Suplier.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!suplier) throw new NotFoundError('Suplier');
    suplier.set({ name: data.name, description: data.description });
    await suplier.save();
    msg.ack();
  }
}
