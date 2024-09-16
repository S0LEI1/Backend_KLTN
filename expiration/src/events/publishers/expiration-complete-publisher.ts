import {
  Publisher,
  Subjects,
  ExpiraionCompleteEvent,
} from '@share-package/common';

export class ExpirationCompletePublisher extends Publisher<ExpiraionCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
