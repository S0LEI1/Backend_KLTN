import { Request, Response } from 'express';
import { RolePermissionServices } from '../services/role-permission.service';
export class RolePermissionControllers {
  static async addPermissionForRole(req: Request, res: Response) {
    try {
      const { roleId, permissionIds } = req.body;
      const newRPS = await RolePermissionServices.addPermissionForRole(
        roleId,
        permissionIds
      );
      res.status(201).send({
        message: 'POST: Add permission for role successfully',
        newRPS,
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async removePermissionForRole(req: Request, res: Response) {
    const { roleId, permissionIds } = req.body;
    await RolePermissionServices.removePermissionOfRole(roleId, permissionIds);
    res.status(200).send({ message: 'DELETE: remove permission successfully' });
  }
}
