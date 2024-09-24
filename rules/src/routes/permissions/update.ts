import express, { Request, Response } from 'express';
import { BadRequestError } from '@share-package/common';
import { Permission } from '../../models/permission';
import { natsWrapper } from '../../nats-wrapper';
import { PermissionUpdatedPublisher } from '../../events/publishers/permissions/permission-updated-publisher';
const router = express.Router();

router.patch('/rules/permission/:id', async (req: Request, res: Response) => {
  const permissions = req.currentUser?.permissions;
  // check permission
  // if (!permissions?.includes(ManagerPermission.CRUDPermissions)) {
  //   throw new BadRequestError('Not permission for update permission');
  // }
  const existsPermission = await Permission.findById(req.params.id);
  if (!existsPermission) {
    throw new BadRequestError('Permission do not exists');
  }
  const { name, systemName, description } = req.body;
  existsPermission.set({
    name: name,
    systemName: systemName,
    description: description,
  });
  await existsPermission.save();
  //publish event
  new PermissionUpdatedPublisher(natsWrapper.client).publish({
    id: existsPermission.id,
    name: existsPermission.name,
    active: existsPermission.active,
    systemName: existsPermission.systemName,
    description: existsPermission.description,
    version: existsPermission.version,
  });
  res.status(201).send(existsPermission);
});

export { router as updatePermissionRouter };
