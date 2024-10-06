import {
  BadRequestError,
  NotFoundError,
  Pagination,
} from '@share-package/common';
import { Role } from '../models/role';
import { RolePermission } from '../models/role-permission';
import { AccountRoleDoc } from '../models/account-role-mapping';
import { Permission } from '../models/permission';
import mongoose from 'mongoose';
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
  static async readAll(pages: string, sortBy: string) {
    const query = Pagination.query();
    query.isDeleted = false;
    const options = Pagination.options(pages, PER_PAGE!, sortBy);
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
      isManager
    );
    return { role, permissions };
  }
  static async readPermissionsOfRole(
    id: string,
    pages: string,
    sortBy: string,
    isManager: boolean
  ) {
    try {
      const options = Pagination.options(pages, PER_PAGE!, sortBy);
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
}
