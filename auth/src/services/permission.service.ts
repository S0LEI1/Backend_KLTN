import { NotFoundError, Pagination } from '@share-package/common';
import { Permission, PermissionDoc } from '../models/permission';
import { Role } from '../models/role';
import { RolePermission } from '../models/role-permission';
const PER_PAGE = process.env.PER_PAGE!;
export class PermissionServices {
  static async readAll(pages: string, sortBy: string) {
    const options = Pagination.options(pages, PER_PAGE, sortBy);
    const permissions = await Permission.find({}, null, options);
    return permissions;
  }
  static async readPermissionByRoleId(id: string) {
    const role = await Role.findOne({ _id: id, isDeleted: false });
    if (!role) throw new NotFoundError('Role');
    const rolePermission = await RolePermission.find({
      role: role.id,
    }).populate('permission');
    const permissions: PermissionDoc[] = [];
    for (const rp of rolePermission) {
      const permission = await Permission.findById(rp.permission);
      if (permission) permissions.push(permission);
    }
    return permissions;
  }
}
