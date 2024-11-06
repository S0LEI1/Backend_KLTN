import { ShiftCreatedPublisher } from '../../events/publishers/shifts/shift-created-publisher';
import { ShiftUpdatedPublisher } from '../../events/publishers/shifts/shift-updated-publisher';
import { ShiftDoc } from '../../models/shift';
import { natsWrapper } from '../../nats-wrapper';

export class ShiftPublishers {
  static async newShift(shiftDoc: ShiftDoc) {
    new ShiftCreatedPublisher(natsWrapper.client).publish({
      id: shiftDoc.id,
      shiftOptions: shiftDoc.shiftOptions,
      description: shiftDoc.description,
    });
  }
  static async updateShift(shiftDoc: ShiftDoc) {
    new ShiftUpdatedPublisher(natsWrapper.client).publish({
      id: shiftDoc.id,
      description: shiftDoc.description,
      version: shiftDoc.version,
    });
  }
}
