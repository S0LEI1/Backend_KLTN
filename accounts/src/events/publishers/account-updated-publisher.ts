import {
  AccountUpdatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class AccountUpdatedPublisher extends Publisher<AccountUpdatedEvent> {
  subject: Subjects.AccountUpdated = Subjects.AccountUpdated;
}
