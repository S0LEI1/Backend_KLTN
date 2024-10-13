import { Publisher, ShiftCreatedEvent, Subjects } from '@share-package/common';

export class ShiftCreatedPublisher extends Publisher<ShiftCreatedEvent> {
  subject: Subjects.ShiftCreated = Subjects.ShiftCreated;
}
