import express, { Request, Response } from 'express';
import { BadRequestError } from '@share-package/common';
import { Permission } from '../../models/permission';
import { PermissionCreatedPublisher } from '../../events/publishers/permissions/permission-created-publisher';
import { natsWrapper } from '../../nats-wrapper';
import { body } from 'express-validator';
const router = express.Router();

router.post(
  '/rules/new/permission',
  [
    body('name').not().isEmpty().withMessage('Role name must be provided'),
    body('systemName')
      .not()
      .isEmpty()
      .withMessage('System name must be provided'),
  ],
  async (req: Request, res: Response) => {
    const permissions = req.currentUser?.permissions;
    // check permission
    // if (!permissions?.includes(ManagerPermission.CRUDPermissions)) {
    //   throw new BadRequestError('Not permission for create new');
    // }
    const { name, systemName, description } = req.body;
    const permission = Permission.build({
      name: name,
      systemName: systemName,
      active: true,
      description: description,
    });
    await permission.save();
    //publish event
    new PermissionCreatedPublisher(natsWrapper.client).publish({
      id: permission.id,
      name: permission.name,
      systemName: systemName,
      active: permission.active,
      description: permission.description,
      version: permission.version,
    });
    res.status(201).send(permission);
  }
);

export { router as newPerIndex };
