import { NotFoundError, Pagination } from '@share-package/common';
import { User, UserDoc } from '../../models/user';
import { Convert } from '../../utils/convert';
import { UserPublisher } from '../publishers/user.publisher.service';
import { FilterQuery } from 'mongoose';
const PER_PAGE = process.env.PER_PAGE!;
export class ManagerService {
  static async readAll(
    type: string,
    sortBy: string,
    pages: string,
    gender: string
  ) {
    const query = Pagination.query();
    let filter: FilterQuery<UserDoc> = {};

    query.isDeleted = false;
    if (type) filter = { type: type };
    const isMale = gender === 'true' ? true : false;
    if (gender) filter = { ...filter, gender: isMale };
    const sort = Pagination.query();
    if (sortBy === 'asc') sort.lastName = 1;
    if (sortBy === 'desc') sort.lastName = -1;
    console.log(filter);

    const totalItems = await User.find(filter).countDocuments();
    const users = await User.aggregate<UserDoc>([
      { $match: filter },
      {
        $addFields: {
          lastName: { $arrayElemAt: [{ $split: ['$fullName', ' '] }, -1] },
        },
      },
      { $skip: parseInt(pages as string) - 1 },
      { $limit: parseInt(PER_PAGE as string, 10) },
      { $sort: sort },
      { $project: { lastName: 0, password: 0 } },
    ]);

    return { users, totalItems };
  }
  static async pagination(total: number, pages: number) {
    const users = await User.find({})
      .select({
        _id: 1,
        fullName: 1,
        gender: 1,
        phoneNumber: 1,
        avatar: 1,
        address: 1,
        // account: {
        //   _id: 1,
        //   email: 1,
        //   type: 1,
        // },
      })
      .populate({
        path: 'account',
        select: 'email type',
      })
      .sort({ createdAt: -1 })
      .skip(((pages - 1) * parseInt(PER_PAGE as string)) as number)
      .limit(parseInt(PER_PAGE as string))
      .exec();
    return users;
  }
  static async readByType(type: string, sortBy: string, pages: number) {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'accounts',
          localField: 'account',
          foreignField: '_id',
          as: 'account',
        },
      },
      {
        $sort: { createdAt: sortBy === 'asc' ? 1 : -1 },
      },
      {
        $skip: (pages - 1) * parseInt(PER_PAGE as string)!,
      },
      {
        $limit: parseInt(PER_PAGE as string)!,
      },
      {
        $match: {
          'account.type': type,
          isDeleted: false,
        },
      },
      {
        $addFields: {
          accountId: '$account._id',
          email: '$account.email',
          type: '$account.type',
        },
      },
      {
        $unwind: '$email',
      },
      {
        $unwind: '$type',
      },
      {
        $unwind: '$accountId',
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          phoneNumber: 1,
          address: 1,
          avatar: 1,
          accountId: 1,
          email: 1,
          type: 1,
        },
      },
    ]);
    return users;
  }
  static async readByName(name: string, pages: string, sortBy: string) {
    const totalItems = await User.find({
      fullName: new RegExp(name, 'i'),
      isDeleted: false,
    }).countDocuments();
    const sort = Pagination.query();
    if (sortBy === 'asc') sort.lastName = 1;
    if (sortBy === 'desc') sort.lastName = -1;
    const options = Pagination.options(pages, PER_PAGE, sort);
    // const users = await User.find(
    //   { fullName: new RegExp(name, 'i'), isDeleted: false },
    //   { password: 0 },
    //   options
    // );
    const users = await User.aggregate<UserDoc>([
      {
        $match: { fullName: new RegExp(name, 'i'), isDeleted: false },
      },
      {
        $addFields: {
          lastName: { $arrayElemAt: [{ $split: ['$fullName', ' '] }, -1] },
        },
      },
      { $skip: parseInt(pages as string) - 1 },
      { $limit: parseInt(PER_PAGE as string, 10) },
      { $sort: sort },
      { $project: { lastName: 0 } },
    ]);
    return { users, totalItems };
  }
  static async deleteUser(id: string) {
    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) throw new NotFoundError('User');
    user.set({ isDeleted: true });
    await user.save();
    UserPublisher.deleteUser(user);
    return user;
  }
}
