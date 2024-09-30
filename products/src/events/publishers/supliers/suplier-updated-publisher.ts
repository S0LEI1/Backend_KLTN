import {
  Publisher,
  Subjects,
  SuplierUpdatedEvent,
} from '@share-package/common';

export class SuplierUpdatedPublisher extends Publisher<SuplierUpdatedEvent> {
  subject: Subjects.SuplierUpdated = Subjects.SuplierUpdated;
}
