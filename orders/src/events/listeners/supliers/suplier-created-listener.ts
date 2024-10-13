import { Listener, Subjects, SuplierCreatedEvent } from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Suplier } from '../../../models/suplier';

export class SuplierCreatedListener extends Listener<SuplierCreatedEvent> {
  subject: Subjects.SuplierCreated = Subjects.SuplierCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: SuplierCreatedEvent['data'], msg: Message) {
    const suplier = Suplier.build({
      id: data.id,
      name: data.name,
      description: data.description,
    });
    await suplier.save();
    msg.ack();
  }
}
