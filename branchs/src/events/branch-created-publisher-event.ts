import { BranchCreatedEvent, Publisher, Subjects } from '@share-package/common';

export class BranchCreatedPublisher extends Publisher<BranchCreatedEvent> {
  subject: Subjects.BranchCreated = Subjects.BranchCreated;
}
