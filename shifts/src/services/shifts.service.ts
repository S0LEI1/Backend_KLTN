import {
  BadRequestError,
  NotFoundError,
  UserShiftStatus,
} from '@share-package/common';
import { Shift, ShiftAttrs } from '../models/shift';
import { ShiftPublishers } from './publishers/shifts.publisher.service';
import { Check } from '../utils/check';

export class ShiftServices {
  static async newShift(attrs: ShiftAttrs) {
    const existShift = await Shift.findOne({
      shiftOptions: attrs.shiftOptions,
    });
    const option = Check.checkOptions(attrs.shiftOptions);
    if (!option) throw new BadRequestError('Option must be valid');
    if (existShift) throw new BadRequestError('Shift is exist');
    const shift = Shift.build({
      shiftOptions: option,
      description: attrs.description,
    });
    await shift.save();
    ShiftPublishers.newShift(shift);
    return shift;
  }
  static async readAll(pages: string, sortBy: string) {}
}
