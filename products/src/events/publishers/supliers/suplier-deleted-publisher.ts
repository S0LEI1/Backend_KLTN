import {
  Publisher,
  Subjects,
  SuplierDeletedEvent,
} from '@share-package/common';

export class SuplierDeletedPublisher extends Publisher<SuplierDeletedEvent> {
  subject: Subjects.SuplierDeleted = Subjects.SuplierDeleted;
}
