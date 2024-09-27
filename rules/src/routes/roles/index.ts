import express, { Request, Response } from 'express';
import {
  BadRequestError,
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
} from '@share-package/common';
import { Permission } from '../../models/permission';
import { natsWrapper } from '../../nats-wrapper';
import { Role } from '../../models/role';
const router = express.Router();

router.get(
  '/rules/roles',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission(ListPermission.RoleRead),
  async (req: Request, res: Response) => {
    const roles = await Role.find();
    res.status(201).send(roles);
  }
);

export { router as indexRolesRouter };
