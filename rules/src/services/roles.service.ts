import {
  BadRequestError,
  NotFoundError,
  Pagination,
} from '@share-package/common';
import { Role } from '../models/role';
import { RolePublisher } from './role.publisher.service';
import { RolePermission } from '../models/role-permission';
const PER_PAGE = process.env.PER_PAGE;
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
    RolePublisher.newRole(newRole);
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
    const rolePermissions = await this.readPermissionsOfRole(
      id,
      pages,
      sortBy,
      isManager
    );
    return { role, rolePermissions };
  }
  static async readPermissionsOfRole(
    id: string,
    pages: string,
    sortBy: string,
    isManager: boolean
  ) {
    const options = Pagination.options(pages, PER_PAGE!, sortBy);
    const rolePermissions = await RolePermission.find(
      { role: id },
      null,
      options
    ).populate({
      path: 'permission',
      select: isManager ? null : 'id systemName description',
    });
    return rolePermissions;
  }
}
