import {
  BadRequestError,
  NotFoundError,
  ShiftOptions,
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
    if (existShift) throw new BadRequestError('Shift is exist');
    const shift = Shift.build({
      shiftOptions: attrs.shiftOptions as ShiftOptions,
      description: attrs.description,
    });
    await shift.save();
    ShiftPublishers.newShift(shift);
    return shift;
  }
  static async readAll() {
    const shifts = await Shift.find({ isDeleted: false }).sort({
      createdAt: 1,
    });
    return shifts;
  }
  static async readOne(id: string) {
    const shift = await Shift.findOne({ _id: id, isDeleted: false });
    if (!shift) throw new NotFoundError('Shift');
    return shift;
  }
  static async updateShift(attrs: { id: string; description: string }) {
    const shift = await Shift.findOne({ _id: attrs.id, isDeleted: false });
    if (!shift) throw new NotFoundError('Shift');
    shift.set({ description: attrs.description });
    await shift.save();
    return shift;
  }
}
