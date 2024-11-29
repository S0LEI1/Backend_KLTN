import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
