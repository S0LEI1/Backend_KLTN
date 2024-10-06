import { BadRequestError, NotFoundError } from '@share-package/common';
import { Account } from '../models/account';
import { AccountRole, AccountRoleDoc } from '../models/account-role-mapping';
import { Role } from '../models/role';

export class AccountRoleService {
  static async newACR(accountId: string, roleIds: string[]) {
    const existAccount = await Account.findAccount(accountId);
    const existRoles = await Role.find({ _id: { $in: roleIds } });
    if (!existRoles) throw new NotFoundError('Roles');
    const ACRExist = await AccountRole.find({
      role: { $in: roleIds },
      account: existAccount!.id,
    });
    console.log(ACRExist);

    if (ACRExist.length > 0) throw new BadRequestError('Account-Role exist');
    const accountRoles: AccountRoleDoc[] = [];
    for (const role of existRoles) {
      const newACR = AccountRole.build({
        account: existAccount!,
        role: role,
      });
      await newACR.save();
      accountRoles.push(newACR);
    }
    return accountRoles;
  }
  static async deleteACR(accountId: string, roleIds: string[]) {
    const existAccount = await Account.findAccount(accountId);
    const existRoles = await Role.find({ _id: { $in: roleIds } });
    if (!existRoles) throw new NotFoundError('Roles');
    const ACRExist = await AccountRole.find({
      role: { $in: roleIds },
      account: existAccount!.id,
    });
    if (ACRExist.length === 0)
      throw new BadRequestError('Account-Role do not exist');
    await AccountRole.deleteMany({
      account: existAccount,
      role: { $in: existRoles },
    });
  }
}
