import {
  Publisher,
  RolePermissionDeletedEvent,
  Subjects,
} from '@share-package/common';

export class RolePermissionDeletedPublisher extends Publisher<RolePermissionDeletedEvent> {
  subject: Subjects.RolePermissionDeleted = Subjects.RolePermissionDeleted;
}
