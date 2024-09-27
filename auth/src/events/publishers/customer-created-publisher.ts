import {
  CustomerCreatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class CustomerCreatedPublisher extends Publisher<CustomerCreatedEvent> {
  subject: Subjects.CustomerCreated = Subjects.CustomerCreated;
}
