import {
  Publisher,
  RolePermissionCreatedEvent,
  Subjects,
} from '@share-package/common';

export class RolePermissionCreatedPublisher extends Publisher<RolePermissionCreatedEvent> {
  subject: Subjects.RolePermissionCreated = Subjects.RolePermissionCreated;
}
