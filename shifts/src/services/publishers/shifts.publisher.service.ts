import { ShiftCreatedPublisher } from '../../events/publishers/shift-created-publisher';
import { ShiftDoc } from '../../models/shift';
import { natsWrapper } from '../../nats-wrapper';

export class ShiftPublishers {
  static async newShift(shiftDoc: ShiftDoc) {
    new ShiftCreatedPublisher(natsWrapper.client).publish({
      id: shiftDoc.id,
      begin: shiftDoc.begin,
      end: shiftDoc.end,
      description: shiftDoc.description,
    });
  }
}
