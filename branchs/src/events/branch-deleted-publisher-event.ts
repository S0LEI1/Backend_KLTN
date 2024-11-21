import { BranchDeletedEvent, Publisher, Subjects } from '@share-package/common';

export class BranchDeletedPublisher extends Publisher<BranchDeletedEvent> {
  subject: Subjects.BranchDeleted = Subjects.BranchDeleted;
}
