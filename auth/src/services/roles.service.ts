import {
  BadRequestError,
  NotFoundError,
  Pagination,
} from '@share-package/common';
import { Role, RoleDoc } from '../models/role';
import { RolePermission } from '../models/role-permission';
import { Permission, PermissionDoc } from '../models/permission';
import mongoose from 'mongoose';
import { UserRoleDoc } from '../models/user-role-mapping';
const PER_PAGE = process.env.PER_PAGE;
interface Lookup {
  id: string;
  systemName: string;
  permission: string[];
}
export class RoleServices {
  static async newRole(name: string, description: string, systemName: string) {
    const exsistRole = await Role.findOne({ name: name, isDeleted: false });
    if (exsistRole) throw new BadRequestError('Role name exist');
    const newRole = Role.build({
      name: name,
      systemName: systemName.toLowerCase(),
      description: description,
    });
    await newRole.save();
    //publish event
    return newRole;
  }
  static async readAll(pages: string, sortBy: string, name: string) {
    const query = Pagination.query();
    const sort = Pagination.query();
    sort.name = 1;
    if (name === 'desc') sort.name = -1;
    query.isDeleted = false;
    const options = Pagination.options(pages, PER_PAGE!, sort);
    const roles = await Role.find(query, null, options);
    return roles;
  }
  static async readOne(
    id: string,
    isManager: boolean,
    pages: string,
    sortBy: string
  ) {
    const role = await Role.findRole(id);
    if (!role) throw new NotFoundError('Role');
    const permissions = await this.readPermissionsOfRole(
      id,
      pages,
      sortBy,
      isManager,
      ''
    );
    const notInPermission = await this.readPermssionNotInRole(id, isManager);
    return { role, permissions, notInPermission };
  }
  static async readPermssionNotInRole(roleId: string, isManager: boolean) {
    if (isManager === false) return null;
    const rolePermissions = await RolePermission.find(
      { role: roleId },
      { permission: 1 }
    ).populate('permission');
    const existPermissions: PermissionDoc[] = [];
    for (const rp of rolePermissions) {
      existPermissions.push(rp.permission);
    }
    const permissions = await Permission.find({
      _id: { $nin: existPermissions },
    });
    return permissions;
  }
  static async readPermissionsOfRole(
    id: string,
    pages: string,
    sortBy: string,
    isManager: boolean,
    name: string
  ) {
    try {
      const sort = Pagination.query();
      sort.name = 1;
      const options = Pagination.options(pages, PER_PAGE!, sort);
      const rolePermissions = await RolePermission.find(
        { role: id },
        null,
        options
      );
      const permissionId: mongoose.Types.ObjectId[] = [];
      rolePermissions.forEach((rp) =>
        permissionId.push(new mongoose.Types.ObjectId(rp.permission.id))
      );
      const permissions = await Permission.find(
        { _id: { $in: permissionId } },
        isManager ? null : { systemName: 0, version: 0 }
      );
      return permissions;
    } catch (error) {
      console.log(error);
    }
  }
  static async deleteRole(id: string) {
    const role = await Role.findRole(id);
    if (!role) throw new NotFoundError('Permission');
    role.set({ isDeleted: false });
    await role.save();
    // publish permission delete event
    return role;
  }
  static async readRoleOfAccount(accountRoles: UserRoleDoc[]) {
    const roleIds: mongoose.Types.ObjectId[] = [];
    for (const acr of accountRoles) {
      roleIds.push(new mongoose.Types.ObjectId(acr.role.id));
    }
    const roles = await Role.find({ _id: { $in: roleIds } });
    return roles;
  }
  static async readRoleNotInAccount(accountRoles: UserRoleDoc[]) {
    const roleIds: mongoose.Types.ObjectId[] = [];
    for (const acr of accountRoles) {
      roleIds.push(new mongoose.Types.ObjectId(acr.role.id));
    }
    const roles = await Role.find({ _id: { $nin: roleIds } });
    return roles;
  }
}
