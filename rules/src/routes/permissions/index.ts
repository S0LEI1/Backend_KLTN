import express, { Request, Response } from 'express';
import {
  BadRequestError,
  ManagerPermission,
  requireManagerRole,
} from '@share-package/common';
import { Permission } from '../../models/permission';
import { PermissionCreatedPublisher } from '../../events/publishers/permissions/permission-created-publisher';
import { natsWrapper } from '../../nats-wrapper';
const router = express.Router();

router.get(
  '/rules/permissions',
  requireManagerRole,
  async (req: Request, res: Response) => {
    const permissions = req.currentUser?.permissions;
    // if (!permissions?.includes(ManagerPermission.CRUDPermissions)) {
    //   throw new BadRequestError('Not permission for read list permission');
    // }
    const listPer = await Permission.find();
    res.status(201).send(listPer);
  }
);

export { router as indexPerRouter };
