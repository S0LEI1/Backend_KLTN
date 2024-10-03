import {
  Publisher,
  ServiceUpdatedEvent,
  Subjects,
} from '@share-package/common';

export class ServiceUpdatedPublisher extends Publisher<ServiceUpdatedEvent> {
  subject: Subjects.ServiceUpdated = Subjects.ServiceUpdated;
}
