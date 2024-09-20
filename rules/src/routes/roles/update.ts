import express, { Request, Response } from 'express';
import {
  BadRequestError,
  ManagerPermission,
  requireManagerRole,
  validationRequest,
} from '@share-package/common';
import { Permission } from '../../models/permission';
import { natsWrapper } from '../../nats-wrapper';
import { UserRole } from '../../models/user-role';
import { RoleUpdatedPublisher } from '../../events/publishers/roles/role-updated-publisher';
import { body } from 'express-validator';
const router = express.Router();

router.patch(
  '/rules/update/role/:id',
  [body('name').not().isEmpty().withMessage('Role name must be provided')],
  validationRequest,
  requireManagerRole,
  async (req: Request, res: Response) => {
    const permissions = req.currentUser?.permissions;
    /// if (
    //   !permissions!.includes(ManagerPermission.CRUDPermissions) ||
    //   !permissions!.includes(ManagerPermission.ReadAndWriteRole)
    // ) {
    //   throw new BadRequestError('Not permission for update role');
    // }
    const existsRole = await UserRole.findById(req.params.id);
    if (!existsRole) {
      throw new BadRequestError('Role do not exists');
    }
    const { name, description } = req.body;
    existsRole.set({
      name,
      description,
    });
    await existsRole.save();
    //publish event
    new RoleUpdatedPublisher(natsWrapper.client).publish({
      id: existsRole.id,
      name: existsRole.name,
      description: existsRole.description,
      active: existsRole.active,
      version: existsRole.version,
    });
    res.status(201).send(existsRole);
  }
);

export { router as updateRoleRouter };
