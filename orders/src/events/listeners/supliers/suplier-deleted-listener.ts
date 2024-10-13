import {
  Listener,
  NotFoundError,
  Subjects,
  SuplierDeletedEvent,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Suplier } from '../../../models/suplier';

export class SuplierDeletedListener extends Listener<SuplierDeletedEvent> {
  subject: Subjects.SuplierDeleted = Subjects.SuplierDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: SuplierDeletedEvent['data'], msg: Message) {
    const suplier = await Suplier.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!suplier) throw new NotFoundError('Suplier');
    suplier.set({ isDeleted: data.isDeleted });
    await suplier.save();
    msg.ack();
  }
}
