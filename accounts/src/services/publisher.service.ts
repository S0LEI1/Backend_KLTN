import { AccountDeletedPublisher } from '../events/publishers/account-deleted-publisher';
import { AccountDoc } from '../models/account';
import { natsWrapper } from '../nats-wrapper';

export class PublisherServices {
  static async accountDelete(account: AccountDoc, userId: string) {
    new AccountDeletedPublisher(natsWrapper.client).publish({
      id: account.id,
      version: account.version,
      user: userId,
    });
  }
}
