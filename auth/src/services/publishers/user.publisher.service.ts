import { UserCreatedPublisher } from '../../events/publishers/user-created-publisher';
import { UserDeletedPublisher } from '../../events/publishers/user-deleted-publisher';
import { UserUpdatedPublisher } from '../../events/publishers/user-updated-publisher';
import { UserDoc } from '../../models/user';
import { natsWrapper } from '../../nats-wrapper';

export class UserPublisher {
  static async newUser(userDoc: UserDoc) {
    new UserCreatedPublisher(natsWrapper.client).publish({
      id: userDoc.id,
      fullName: userDoc.fullName,
      phoneNumber: userDoc.phoneNumber,
      gender: userDoc.gender,
      address: userDoc.address,
      type: userDoc.type,
      email: userDoc.email,
    });
  }
  static async updateUser(userDoc: UserDoc) {
    new UserUpdatedPublisher(natsWrapper.client).publish({
      id: userDoc.id,
      fullName: userDoc.fullName,
      phoneNumber: userDoc.phoneNumber,
      gender: userDoc.gender,
      address: userDoc.address,
      type: userDoc.type,
      email: userDoc.email,
      version: userDoc.version,
    });
  }
  static async deleteUser(userDoc: UserDoc) {
    new UserDeletedPublisher(natsWrapper.client).publish({
      id: userDoc.id,
      isDeleted: userDoc.isDeleted,
      version: userDoc.version,
      type: userDoc.type,
    });
  }
}
