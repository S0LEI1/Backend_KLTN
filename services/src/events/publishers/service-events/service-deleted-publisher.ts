import {
  Publisher,
  ServiceDeletedEvent,
  Subjects,
} from '@share-package/common';

export class ServiceDeletedPublisher extends Publisher<ServiceDeletedEvent> {
  subject: Subjects.ServiceDeleted = Subjects.ServiceDeleted;
}
