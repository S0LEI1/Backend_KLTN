import { AccountCreatedPublisher } from '../events/publishers/account-created-publisher';
import { AccountDoc } from '../models/account';
import { User, UserDoc } from '../models/user';
import { natsWrapper } from '../nats-wrapper';
import { compareType } from '../utils/type';
const PER_PAGE = 25;
export class AccountService {
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
      .skip((pages - 1) * PER_PAGE)
      .limit(PER_PAGE)
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
}
