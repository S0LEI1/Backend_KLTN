import {
  Publisher,
  Subjects,
  UserShiftCreatedEvent,
} from '@share-package/common';
export class UserShiftCreatedPublisher extends Publisher<UserShiftCreatedEvent> {
  subject: Subjects.UserShiftCreated = Subjects.UserShiftCreated;
}
