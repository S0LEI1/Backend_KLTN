import {
  AccountRoleDeletedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class AccountRoleDeletedPublisher extends Publisher<AccountRoleDeletedEvent> {
  subject: Subjects.AccountRoleDeleted = Subjects.AccountRoleDeleted;
}
