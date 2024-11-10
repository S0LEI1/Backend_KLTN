import {
  BadRequestError,
  NotFoundError,
  ShiftOptions,
  UserShiftStatus,
} from '@share-package/common';
import { UserShift, UserShiftDoc } from '../models/user-shift';
import { User } from '../models/user';
import { Shift } from '../models/shift';
import { format } from 'date-fns';
import { FilterQuery } from 'mongoose';
import { UserShiftPublisher } from './publishers/user-shift.publisher.service';

export class UserShiftServices {
  static async newUS(attrs: { empId: string; shiftId: string; date: Date }) {
    const dateFormat = format(attrs.date, 'yyyy-MM-dd');
    const convertDate = new Date(dateFormat);
    const existUS = await UserShift.findOne({
      user: attrs.empId,
      shift: attrs.shiftId,
      date: convertDate,
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
    UserShiftPublisher.newUS(us);
    return us;
  }
  static async readAllForManager(date: string) {
    let filter: FilterQuery<UserShiftDoc> = {};
    let sort: FilterQuery<UserShiftDoc> = {};
    console.log(date);

    if (date) {
      const dateFormat = format(date, 'yyyy-MM-dd');
      const convertDate = new Date(dateFormat);
      filter = { date: convertDate };
      sort = { shiftOption: 1, lastName: 1 };
    }
    const us = await UserShift.aggregate([
      {
        $lookup: {
          from: 'shifts',
          localField: 'shift',
          foreignField: '_id',
          as: 'shift',
        },
      },
      {
        $addFields: {
          shiftOption: '$shift.shiftOptions',
          shiftDescription: '$shift.description',
        },
      },
      {
        $unwind: '$shiftOption',
      },
      {
        $unwind: '$shiftDescription',
      },
      { $match: filter },
      {
        $project: { shift: 0 },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $addFields: {
          empId: '$user._id',
          empName: '$user.fullName',
          empPhoneNumber: '$user.phoneNumber',
        },
      },
      {
        $unwind: '$empName',
      },
      {
        $unwind: '$empId',
      },
      {
        $unwind: '$empPhoneNumber',
      },
      {
        $addFields: {
          lastName: { $arrayElemAt: [{ $split: ['$empName', ' '] }, -1] },
        },
      },
      {
        $sort: sort,
      },
      {
        $project: { user: 0, lastName: 0 },
      },
    ]);
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
