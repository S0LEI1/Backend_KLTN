import express, { Request, Response } from 'express';
import {
  BadRequestError,
  ManagerPermission,
  requireManagerRole,
} from '@share-package/common';
import { Permission } from '../../models/permission';
import { PermissionCreatedPublisher } from '../../events/publishers/permission-created-publisher';
import { natsWrapper } from '../../nats-wrapper';
const router = express.Router();

router.post(
  '/rules/new/permission',
  requireManagerRole,
  async (req: Request, res: Response) => {
    const permissions = req.currentUser?.permissions;
    if (!permissions?.includes(ManagerPermission.CRUDPermissions)) {
      throw new BadRequestError('Not permission for create new');
    }
    const { name, systemName, description } = req.body;
    const permission = Permission.build({
      name: name,
      systemName: systemName,
      description: description,
    });
    await permission.save();
    //publish event
    new PermissionCreatedPublisher(natsWrapper.client).publish({
      id: permission.id,
      name: permission.name,
      systemName: systemName,
      description: permission.description,
      version: permission.version,
    });
    res.status(201).send(permission);
  }
);

export { router as newPerIndex };
