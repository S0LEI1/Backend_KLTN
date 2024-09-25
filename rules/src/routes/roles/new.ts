import express, { Request, Response } from 'express';
import {
  BadRequestError,
  validationRequest,
  requireAuth,
  requireType,
  UserType,
  requirePermission,
  ListPermission,
} from '@share-package/common';
import { Permission } from '../../models/permission';
import { natsWrapper } from '../../nats-wrapper';
import { UserRole } from '../../models/user-role';
import { RoleCreatedPublisher } from '../../events/publishers/roles/role-created-publisher';
import { body } from 'express-validator';
const router = express.Router();

router.post(
  '/rules/new/role',
  [body('name').not().isEmpty().withMessage('Role name must be provided')],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission(ListPermission.RoleCreate),
  async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const newRole = UserRole.build({
      name: name,
      active: true,
      description: description,
    });
    await newRole.save();
    //publish event
    new RoleCreatedPublisher(natsWrapper.client).publish({
      id: newRole.id,
      name: newRole.name,
      active: newRole.active,
      description: newRole.description,
      version: newRole.version,
    });
    res.status(201).send({ create: 'success', newRole });
  }
);

export { router as newRoleIndex };
