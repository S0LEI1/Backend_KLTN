import { Publisher, ShiftUpdatedEvent, Subjects } from '@share-package/common';

export class ShiftUpdatedPublisher extends Publisher<ShiftUpdatedEvent> {
  subject: Subjects.ShiftUpdated = Subjects.ShiftUpdated;
}
