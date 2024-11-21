import {
  BranchUpdatedEvent,
  Listener,
  NotFoundError,
  Subjects,
} from '@share-package/common';
import { queueGroupName } from '../queueGroupName';
import { Message } from 'node-nats-streaming';
import { Branch } from '../../../models/branch';

export class BranchUpdatedListener extends Listener<BranchUpdatedEvent> {
  subject: Subjects.BranchUpdated = Subjects.BranchUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: BranchUpdatedEvent['data'], msg: Message) {
    const branch = await Branch.findByEvent({
      id: data.id,
      version: data.version,
    });
    if (!branch) throw new NotFoundError('Branch not found');
    branch.set({
      name: data.name,
      phoneNumber: data.phoneNumber,
      email: data.email,
      address: data.address,
    });
    await branch.save();
    msg.ack();
  }
}
