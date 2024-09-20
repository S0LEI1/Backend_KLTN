import express, { Request, Response } from 'express';
import { RolePermission } from '../../models/role-permission';
import { NotFoundError, requireManagerRole } from '@share-package/common';
import { RolePermissionDeletedPublisher } from '../../events/publishers/role-permission/role-permission-deleted-publisher';
import { natsWrapper } from '../../nats-wrapper';
const router = express.Router();
router.delete(
  '/rules/delete/:id',
  requireManagerRole,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const rolePer = await RolePermission.findById(id);
    if (!rolePer) throw new NotFoundError('Role-Permission');
    await RolePermission.deleteOne({ _id: id });
    new RolePermissionDeletedPublisher(natsWrapper.client).publish({
      id: rolePer.id,
      version: rolePer.version,
    });
    res.status(203).send({ message: 'Remove permission success' });
  }
);
export { router as deleteRolePermissionRouter };
