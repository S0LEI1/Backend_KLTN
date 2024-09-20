import { Publisher, RoleDeletedEvent, Subjects } from '@share-package/common';

export class RoleDeletedPublisher extends Publisher<RoleDeletedEvent> {
  subject: Subjects.RoleDeleted = Subjects.RoleDeleted;
}
