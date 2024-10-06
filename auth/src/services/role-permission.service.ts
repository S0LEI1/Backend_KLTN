import { BadRequestError, NotFoundError } from '@share-package/common';
import { AccountRole, AccountRoleDoc } from '../models/account-role-mapping';
import { Role } from '../models/role';
import { RolePermission, RolePermissionAttrs } from '../models/role-permission';
import { Convert } from '../utils/convert';
import { AccountDoc } from '../models/account';
import mongoose from 'mongoose';
import { Permission } from '../models/permission';
const ObjectId = mongoose.Types.ObjectId;
export class RolePermissionServices {
  static async addPermissionForRole(roleId: string, permissionIds: string[]) {
    const role = await Role.findRole(roleId);
    const permissions = await Permission.find({ _id: { $in: permissionIds } });
    if (!permissions) throw new NotFoundError('Permission');
    const RPSexist = await RolePermission.find({
      role: role,
      permission: { $in: permissionIds },
    });
    if (RPSexist.length > 0) {
      throw new BadRequestError('Role-Permission exist ');
    }
    const rolePermissions: RolePermissionAttrs[] = [];
    for (const permission of permissions) {
      rolePermissions.push({
        permission: permission,
        role: role!,
      });
    }
    const newRPS = await RolePermission.insertMany(rolePermissions);
    return newRPS;
  }
  static async removePermissionOfRole(roleId: string, permissionIds: string[]) {
    const role = await Role.findRole(roleId);
    const permissions = await Permission.find({ _id: { $in: permissionIds } });
    if (!permissions) throw new NotFoundError('Permissions');
    await RolePermission.deleteMany({
      role: role,
      permission: { $in: permissions },
    });
  }
  static async readPermissionByAccountRole(acr: AccountRoleDoc) {
    const role = await Role.findOne({ _id: acr.role });
    if (!role) throw new NotFoundError('Role');
    const rolePer = await RolePermission.find({ role: role.id }).populate(
      'permission'
    );
    const permissions = Convert.rolePermissionToPermissions(rolePer!);
    const systemNames: string[] = [];
    permissions.forEach((per) => systemNames.push(per.systemName));
    return { role, systemNames };
  }
  static async readPermissionByAccount(id: string) {
    const permissions = await AccountRole.aggregate([
      {
        $match: { account: new ObjectId(id) },
      },
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'role',
        },
      },
      {
        $unwind: '$role',
      },
      {
        $project: { _id: 1, 'role._id': 1, 'role.systemName': 1, account: 1 },
      },
      {
        $lookup: {
          from: 'rolepermissions',
          localField: 'role._id',
          foreignField: 'role',
          as: 'rolepermission',
        },
      },
      {
        $lookup: {
          from: 'permissions',
          localField: 'rolepermission.permission',
          foreignField: '_id',
          as: 'permissionsmapping',
        },
      },
      {
        $project: { 'role.systemName': 1, 'permissionsmapping.systemName': 1 },
      },
      {
        $unwind: '$role',
      },
      {
        $addFields: {
          permissions: '$permissionsmapping.systemName',
          roles: '$role.systemName',
        },
      },
      {
        $unwind: '$permissions',
      },
      {
        $project: {
          _id: 0,
          permissions: 1,
          roles: 1,
        },
      },
      {
        $group: {
          _id: null,
          roles: { $push: '$roles' },
          permissions: { $push: '$permissions' },
        },
      },
      {
        $project: {
          roles: { $setUnion: ['$roles'] },
          permissions: { $setUnion: '$permissions' },
        },
      },
    ]);
    return permissions;
  }
}
