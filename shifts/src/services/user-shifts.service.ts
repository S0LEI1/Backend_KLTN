import {
  BadRequestError,
  NotFoundError,
  UserShiftStatus,
} from '@share-package/common';
import { UserShift } from '../models/user-shift';
import { User } from '../models/user';
import { Shift } from '../models/shift';

export class UserShiftServices {
  static async newUS(attrs: { empId: string; shiftId: string; date: Date }) {
    const existUS = await UserShift.findOne({
      user: attrs.empId,
      shift: attrs.shiftId,
      date: attrs.date,
    });
    const user = await User.findOne({ _id: attrs.empId, isDeleted: false });
    if (!user) throw new NotFoundError('Employee');
    const shift = await Shift.findOne({ _id: attrs.shiftId, isDeleted: false });
    if (!shift) throw new NotFoundError('Shift');
    if (existUS) throw new BadRequestError('User-Shift is exist');
    const us = UserShift.build({
      user: user,
      shift: shift,
      status: UserShiftStatus.Created,
      date: attrs.date,
    });
    await us.save();
    return us;
  }
  static async readAll() {
    const us = await UserShift.find({ isDeleted: false })
      .populate('user')
      .populate({
        path: 'shift',
        options: { sort: [['shiftOptions', 'asc']] },
      });
    return us;
  }
  static async readOne(shiftId: string, date: Date) {
    const us = await UserShift.findOne({
      shift: shiftId,
      date: date,
      isDeleted: false,
    })
      .populate('user')
      .populate('shift');
    return us;
  }
}
