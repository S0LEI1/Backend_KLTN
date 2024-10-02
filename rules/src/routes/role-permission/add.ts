import {
  BadRequestError,
  ListPermission,
  NotFoundError,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Permission } from '../../models/permission';
import { Role } from '../../models/role';
import { RolePermission } from '../../models/role-permission';
import { RolePermissionCreatedPublisher } from '../../events/publishers/role-permission/role-permission-created-event';
import { natsWrapper } from '../../nats-wrapper';
const router = express.Router();

router.post(
  '/rules/add/',
  [
    body('roleId').isMongoId().withMessage('Role ID must be valid'),
    body('permissionId').isMongoId().withMessage('Permission ID must be valid'),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.RolePermissionCreate]),
  async (req: Request, res: Response) => {
    const { permissionId, roleId } = req.body;
    const permission = await Permission.findById(permissionId);
    if (!permission) throw new NotFoundError('Permission');
    const role = await Role.findById(roleId);
    if (!role) throw new NotFoundError('Role');
    const existRolePer = await RolePermission.findOne({
      permission: permission._id,
      Role: role._id,
    });
    if (existRolePer)
      throw new BadRequestError('Role-Permission already exists');
    if (permission.active === false)
      throw new BadRequestError('Permission has disable');
    if (role.active === false) throw new BadRequestError('Role has disable');
    const rolePer = RolePermission.build({
      permission: permission,
      role: role,
    });
    await rolePer.save();
    new RolePermissionCreatedPublisher(natsWrapper.client).publish({
      id: rolePer.id,
      permissionId: rolePer.permission.id,
      roleId: rolePer.role.id,
      version: rolePer.version,
    });
    res.status(201).send({ message: 'add permission success', rolePer });
  }
);

export { router as addRolePermissionRouter };
