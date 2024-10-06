import { NotFoundError } from '@share-package/common';
import { AccountRole } from '../models/account-role-mapping';

export class PermissionServices {
  static async readPermissionsOfRole(
    id: string,
    pages: string,
    sortBy: string
  ) {
    const accountRole = await AccountRole.findById(id);
    if (!accountRole) throw new NotFoundError('Account-Role');
  }
}
