import {
  Publisher,
  ServiceCreatedEvent,
  Subjects,
} from '@share-package/common';

export class ServiceCreatedPublisher extends Publisher<ServiceCreatedEvent> {
  subject: Subjects.ServiceCreated = Subjects.ServiceCreated;
}
