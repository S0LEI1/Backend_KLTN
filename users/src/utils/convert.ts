import { UserDoc } from '../models/user';

interface ConvertUserAttrs {
  id: string;
  fullName: string;
  phoneNumber: string;
  gender: boolean;
  avatar: string;
  address: string;
  accountId: string;
  email: string;
  type: string;
}
export class Convert {
  static user(userDoc: UserDoc) {
    const convertUser: ConvertUserAttrs = {
      id: userDoc.id,
      fullName: userDoc.fullName,
      phoneNumber: userDoc.phoneNumber,
      gender: userDoc.gender!,
      avatar: userDoc.avatar!,
      address: userDoc.address,
      accountId: userDoc.account!.id,
      email: userDoc.account!.email,
      type: userDoc.account!.type,
    };
    return convertUser;
  }
  static users(userDocs: UserDoc[]) {
    const convertUsers = [];
    for (const user of userDocs) {
      const convert = this.user(user);
      convertUsers.push(convert);
    }
    return convertUsers;
  }
}
