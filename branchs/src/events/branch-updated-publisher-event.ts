import { BranchUpdatedEvent, Publisher, Subjects } from '@share-package/common';

export class BranchUpdatedPublisher extends Publisher<BranchUpdatedEvent> {
  subject: Subjects.BranchUpdated = Subjects.BranchUpdated;
}
