import { Publisher, RoleCreatedEvent, Subjects } from '@share-package/common';

export class RoleCreatedPublisher extends Publisher<RoleCreatedEvent> {
  subject: Subjects.RoleCreated = Subjects.RoleCreated;
}
