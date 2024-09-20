import {
  PermissionCreatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class PermissionCreatedPublisher extends Publisher<PermissionCreatedEvent> {
  subject: Subjects.PermissionCreated = Subjects.PermissionCreated;
}
