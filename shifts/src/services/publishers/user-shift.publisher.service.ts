import {
  ShiftOptions,
  ShiftStatus,
  UserShiftStatus,
} from '@share-package/common';
import { UserShiftCreatedPublisher } from '../../events/publishers/user-shift/user-shift-created-publisher';
import { UserShiftDoc } from '../../models/user-shift';
import { natsWrapper } from '../../nats-wrapper';

export class UserShiftPublisher {
  static async newUS(usDoc: UserShiftDoc) {
    new UserShiftCreatedPublisher(natsWrapper.client).publish({
      id: usDoc.id,
      userId: usDoc.user.id,
      shiftId: usDoc.shift.id,
      status: usDoc.status as UserShiftStatus,
      date: usDoc.date,
    });
  }
}
