import { NotFoundError, Pagination } from '@share-package/common';
import { AccountCreatedPublisher } from '../events/publishers/account-created-publisher';
import { Account, AccountDoc } from '../models/account';
import { User, UserDoc } from '../models/user';
import { natsWrapper } from '../nats-wrapper';
import { compareType } from '../utils/type';
import { Convert } from '../utils/convert';
const PER_PAGE = process.env.PER_PAGE!;
export class AccountService {
  static async readAllUserProfile(type: string, sortBy: string, pages: string) {
    const query = Pagination.query();
    query.isDeleted = false;
    const totalItems = await Account.find(query).countDocuments();
    const options = Pagination.options(pages, PER_PAGE, sortBy);

    if (type) {
      const usersByType = await this.readByType(
        type as string,
        sortBy,
        parseInt(pages as string)
      );
      return usersByType;
    }
    const users = await User.find(query, null, options)
      .populate('account')
      .exec();
    const convert = Convert.users(users);
    return convert;
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
  static async accountCreatedPublisher(account: AccountDoc) {
    new AccountCreatedPublisher(natsWrapper.client).publish({
      id: account.id,
      email: account.email,
      password: account.password,
      type: compareType(account.type),
    });
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
  static async readByName(name: string, pages: number, sortBy: string) {
    const totalItems = await User.find({
      fullName: new RegExp(name, 'i'),
    }).countDocuments();
    const users = await User.find({ fullName: new RegExp(name, 'i') })
      .populate('account')
      .sort({ createdAt: -1 })
      .skip((pages - 1) * parseInt(PER_PAGE as string))
      .limit(parseInt(PER_PAGE as string))
      .exec();
    return { users, totalItems };
  }
}
