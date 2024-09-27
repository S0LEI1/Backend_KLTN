import {
  AccountCreatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class AccountCreatedPublisher extends Publisher<AccountCreatedEvent> {
  subject: Subjects.AccountCreated = Subjects.AccountCreated;
}
