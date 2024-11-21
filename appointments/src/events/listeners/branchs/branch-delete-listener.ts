import {
  BadRequestError,
  BranchDeletedEvent,
  Listener,
  Subjects,
} from '@share-package/common';
import { queueGroupName } from '../queueGroupName';
import { Message } from 'node-nats-streaming';
import { Branch } from '../../../models/branch';

export class BranchDeletedListener extends Listener<BranchDeletedEvent> {
  subject: Subjects.BranchDeleted = Subjects.BranchDeleted;
  queueGroupName: string = queueGroupName;
  async onMessage(data: BranchDeletedEvent['data'], msg: Message) {
    const branch = await Branch.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!branch) throw new BadRequestError('Branch not found');
    branch.set({ isDeleted: data.isDeleted });
    await branch.save();
    msg.ack();
  }
}
