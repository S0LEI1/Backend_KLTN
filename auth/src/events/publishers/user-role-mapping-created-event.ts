import {
  Publisher,
  Subjects,
  UserURMappingCreatedEvent,
} from '@share-package/common';

export class UserURMappingCreatedPublisher extends Publisher<UserURMappingCreatedEvent> {
  subject: Subjects.UserURMCreated = Subjects.UserURMCreated;
}
