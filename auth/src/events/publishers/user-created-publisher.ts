import { UserCreatedEvent, Publisher, Subjects } from '@share-package/common';

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
}
