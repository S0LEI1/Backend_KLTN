import { Request, Response } from 'express';
import { PermissionServices } from '../services/permission.service';
import { Role } from '../models/role';
import { NotFoundError } from '@share-package/common';
import { RolePermission } from '../models/role-permission';

export class PermissionControllers {
  static async readAll(req: Request, res: Response) {
    const { pages, sortBy } = req.query;
    const permissions = await PermissionServices.readAll(
      pages as string,
      sortBy as string
    );
    res
      .status(200)
      .send({ message: 'GET: Permissions successfully', permissions });
  }
  static async readPermissionByRoleId(req: Request, res: Response) {
    try {
      const { roleId } = req.params;
      const permissions = await PermissionServices.readPermissionByRoleId(
        roleId
      );
      // return rolePermission;
      res.status(200).send({
        message: 'GET: Permission by roleId successfully',
        permissions,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
