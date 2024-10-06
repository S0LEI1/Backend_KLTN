import { RolePermissionDoc } from '../models/role-permission';
interface ConvertPermission {
  id?: string;
  name?: string;
  systemName: string;
  description?: string;
}
export class Convert {
  static rolePermissionToPermission(rp: RolePermissionDoc) {
    const convert: ConvertPermission = {
      id: rp.permission.id,
      systemName: rp.permission.systemName,
    };
    return convert;
  }
  static rolePermissionToPermissions(rps: RolePermissionDoc[]) {
    const permissions: ConvertPermission[] = [];
    for (const rp of rps) {
      const permission = this.rolePermissionToPermission(rp);
      permissions.push(permission);
    }
    return permissions;
  }
}
