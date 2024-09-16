import { Publisher, Subjects, UserCreatedEvent } from '@share-package/common';

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
}
