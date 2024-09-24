import express, { Request, Response } from 'express';
import { BadRequestError } from '@share-package/common';
import { Permission } from '../../models/permission';
import { natsWrapper } from '../../nats-wrapper';
import { UserRole } from '../../models/user-role';
const router = express.Router();

router.get('/rules/roles', async (req: Request, res: Response) => {
  const permissions = req.currentUser!.permissions;
  // if (
  //   !permissions!.includes(ManagerPermission.CRUDPermissions) ||
  //   !permissions!.includes(ManagerPermission.ReadAndWriteRole) ||
  //   !permissions!.includes(ManagerPermission.ReadDatabaseRole)
  // ) {
  //   throw new BadRequestError('Not permission for read list role');
  // }
  const roles = await UserRole.find();
  res.status(201).send(roles);
});

export { router as indexRolesRouter };
