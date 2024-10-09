import {
  AccountDeletedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class AccountDeletedPublisher extends Publisher<AccountDeletedEvent> {
  subject: Subjects.AccountDeleted = Subjects.AccountDeleted;
}
