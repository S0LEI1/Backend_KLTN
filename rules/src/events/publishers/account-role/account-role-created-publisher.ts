import {
  Publisher,
  Subjects,
  AccountRoleCreatedEvent,
} from '@share-package/common';

export class AccountRoleCreatedPublisher extends Publisher<AccountRoleCreatedEvent> {
  subject: Subjects.AccountRoleCreated = Subjects.AccountRoleCreated;
}
