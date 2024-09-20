import express, { Request, Response } from 'express';
import {
  BadRequestError,
  ManagerPermission,
  NotFoundError,
  requireManagerRole,
} from '@share-package/common';
import { Permission } from '../../models/permission';
import { natsWrapper } from '../../nats-wrapper';
import { UserRole } from '../../models/user-role';
import { RoleDeletedPublisher } from '../../events/publishers/roles/role-deleted-publisher';
const router = express.Router();

router.patch(
  '/rules/role/:id',
  requireManagerRole,
  async (req: Request, res: Response) => {
    const permissions = req.currentUser?.permissions;
    // check permission
    // if (!permissions?.includes(ManagerPermission.CRUDPermissions)) {
    //   throw new BadRequestError('Not permission for delete permission');
    // }
    const role = await UserRole.findById(req.params.id);
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
