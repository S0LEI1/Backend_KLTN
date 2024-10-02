import express, { Request, Response } from 'express';
import {
  BadRequestError,
  ListPermission,
  NotFoundError,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
} from '@share-package/common';
import { Permission } from '../../models/permission';
import { natsWrapper } from '../../nats-wrapper';
import { Role } from '../../models/role';
import { RoleDeletedPublisher } from '../../events/publishers/roles/role-deleted-publisher';
const router = express.Router();

router.patch(
  '/rules/role/:id',
  requireAuth,
  requireType([UserType.Customer]),
  requirePermission([ListPermission.RoleDelete]),
  async (req: Request, res: Response) => {
    const role = await Role.findById(req.params.id);
    if (!role) throw new NotFoundError('Permission');
    role.set({ active: !role.active });
    await role.save();
    // publish permission delete event
    new RoleDeletedPublisher(natsWrapper.client).publish({
      id: role.id,
      version: role.version,
      active: role.active,
    });

    res.status(201).send({ delete: true, role });
  }
);

export { router as deleteRoleRouter };
