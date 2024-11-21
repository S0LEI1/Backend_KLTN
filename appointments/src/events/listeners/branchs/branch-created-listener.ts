import { BranchCreatedEvent, Listener, Subjects } from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { Branch } from '../../../models/branch';
import { queueGroupName } from '../queueGroupName';

export class BranchCreatedListener extends Listener<BranchCreatedEvent> {
  subject: Subjects.BranchCreated = Subjects.BranchCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: BranchCreatedEvent['data'], msg: Message) {
    const branch = Branch.build({
      id: data.id,
      name: data.name,
      phoneNumber: data.phoneNumber,
      email: data.email,
      address: data.address,
    });
    await branch.save();
    msg.ack();
  }
}
