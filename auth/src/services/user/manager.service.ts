import { NotFoundError, Pagination } from '@share-package/common';
import { User, UserDoc } from '../../models/user';
import { Convert } from '../../utils/convert';
import { UserPublisher } from '../publishers/user.publisher.service';
const PER_PAGE = process.env.PER_PAGE!;
export class ManagerService {
  static async readAll(
    type: string,
    sortBy: string,
    pages: string,
    gender: string,
    name: string
  ) {
    const query = Pagination.query();
    query.isDeleted = false;
    if (type) query.type = type;
    const isMale = gender === 'true' ? true : false;
    if (gender) query.gender = isMale;
    const sort = Pagination.query();
    if (name === 'asc') sort.name = 1;
    if (name === 'desc') sort.name = -1;
    const totalItems = await User.find(query).countDocuments();
    const options = Pagination.options(pages, PER_PAGE, sort);
    const users = await User.find(query, { password: 0 }, options);
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
    sort.name = 1;
    if (name === 'desc') sort.name = -1;
    const options = Pagination.options(pages, PER_PAGE, sort);
    const users = await User.find(
      { fullName: new RegExp(name, 'i'), isDeleted: false },
      { password: 0 },
      options
    );
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
