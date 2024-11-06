import {
  BadRequestError,
  NotFoundError,
  UserShiftStatus,
} from '@share-package/common';
import { Shift, ShiftAttrs } from '../models/shift';
import { ShiftPublishers } from './publishers/shifts.publisher.service';

export class ShiftServices {
  static async newShift(attrs: ShiftAttrs) {
    const existShift = await Shift.findOne({
      shiftOptions: attrs.shiftOptions,
    });
    if (existShift) throw new BadRequestError('Shift is exist');
    const shift = Shift.build({
      shiftOptions: attrs.shiftOptions,
      description: attrs.description,
    });
    await shift.save();
    ShiftPublishers.newShift(shift);
    return shift;
  }
  static async readAll(pages: string, sortBy: string) {}
}
