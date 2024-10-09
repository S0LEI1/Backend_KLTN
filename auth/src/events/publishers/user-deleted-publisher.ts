import { Publisher, Subjects, UserDeletedEvent } from '@share-package/common';

export class UserDeletedPublisher extends Publisher<UserDeletedEvent> {
  subject: Subjects.UserDeleted = Subjects.UserDeleted;
}
