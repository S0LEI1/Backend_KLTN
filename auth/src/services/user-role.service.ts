import { BadRequestError, NotFoundError } from '@share-package/common';
import { Role } from '../models/role';
import { User } from '../models/user';
import { UserRole, UserRoleDoc } from '../models/user-role-mapping';

export class UserRoleService {
  static async newUR(userId: string, roleIds: string[]) {
    const existUser = await User.findOne({ _id: userId, isDeleted: false });
    if (!existUser) throw new NotFoundError('User');
    const existRoles = await Role.find({
      _id: { $in: roleIds },
      isDeleted: false,
    });
    if (!existRoles) throw new NotFoundError('Roles');
    const ACRExist = await UserRole.find({
      role: { $in: roleIds },
      user: existUser!.id,
    });
    if (ACRExist.length > 0) throw new BadRequestError('Account-Role exist');
    const userRoles: UserRoleDoc[] = [];
    for (const role of existRoles) {
      const newUR = UserRole.build({
        user: existUser,
        role: role,
      });
      await newUR.save();
      userRoles.push(newUR);
    }
    return userRoles;
  }
  static async deleteUR(userId: string, roleIds: string[]) {
    const existUser = await User.findOne({ _id: userId, isDeleted: false });
    const existRoles = await Role.find({
      _id: { $in: roleIds },
      isDeleted: false,
    });
    if (!existRoles) throw new NotFoundError('Roles');
    const userRolesExist = await UserRole.find({
      role: { $in: roleIds },
      user: existUser!.id,
    });
    if (userRolesExist.length === 0)
      throw new BadRequestError('Account-Role do not exist');
    await UserRole.deleteMany({
      account: existUser,
      role: { $in: existRoles },
    });
  }
}
