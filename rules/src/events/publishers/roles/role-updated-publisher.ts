import { Publisher, RoleUpdatedEvent, Subjects } from '@share-package/common';

export class RoleUpdatedPublisher extends Publisher<RoleUpdatedEvent> {
  subject: Subjects.RoleUpdated = Subjects.RoleUpdated;
}
