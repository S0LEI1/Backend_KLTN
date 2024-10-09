import { Publisher, Subjects, UserUpdatedEvent } from '@share-package/common';

export class UserUpdatedPublisher extends Publisher<UserUpdatedEvent> {
  subject: Subjects.UserUpdated = Subjects.UserUpdated;
}
