import { BadRequestError, NotFoundError } from '@share-package/common';
import { Shift, ShiftAttrs } from '../models/shift';
import { ShiftPublishers } from './publishers/shifts.publisher.service';

export class ShiftServices {
  static async newShift(begin: Date, end: Date, description: string) {
    const existShift = await Shift.findOne({
      begin: begin,
      end: end,
      isDeleted: false,
    });
    if (existShift) throw new BadRequestError('Shift is exist');
    const shift = Shift.build({
      begin: begin,
      end: end,
      description: description,
    });
    await shift.save();
    ShiftPublishers.newShift(shift);
    return shift;
  }
  static async readAll(pages: string, sortBy: string) {}
}
