import {
  Publisher,
  Subjects,
  SuplierCreatedEvent,
} from '@share-package/common';

export class SuplierCreatedPublisher extends Publisher<SuplierCreatedEvent> {
  subject: Subjects.SuplierCreated = Subjects.SuplierCreated;
}
