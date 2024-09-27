import { AccountCreatedPublisher } from '../events/publishers/account-created-publisher';
import { AccountDoc } from '../models/account';
import { User, UserDoc } from '../models/user';
import { natsWrapper } from '../nats-wrapper';
import { compareType } from '../utils/type';
const PER_PAGE = 25;
export class AccountService {
  static async pagination(total: number, pages: number) {
    const users = await User.find()
      .populate({
        path: 'account',
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
