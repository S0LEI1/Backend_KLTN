import express, { Request, Response } from 'express';
import { BadRequestError, NotFoundError } from '@share-package/common';
import { Permission } from '../../models/permission';
import { PermissionCreatedPublisher } from '../../events/publishers/permissions/permission-created-publisher';
import { natsWrapper } from '../../nats-wrapper';
import { PermissionDeletedPublisher } from '../../events/publishers/permissions/permission-deleted-publisher';
const router = express.Router();

router.patch('/rules/permission/:id', async (req: Request, res: Response) => {
  const permissions = req.currentUser?.permissions;
  // check permission
  // if (!permissions?.includes(ManagerPermission.CRUDPermissions)) {
  //   throw new BadRequestError('Not permission for delete permission');
  // }
  const permission = await Permission.findById(req.params.id);
  if (!permission) throw new NotFoundError('Permission');
  permission.set({ active: !permission.active });
  // publish permission delete event
  new PermissionDeletedPublisher(natsWrapper.client).publish({
    id: permission.id,
    version: permission.version + 1,
    active: permission.active,
  });

  res.status(201).send({ delete: true, permission });
});

export { router as deletePermissionRouter };
