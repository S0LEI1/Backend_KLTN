import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { RoleControllers } from '../../controllers/role.controllers';
import { Role } from '../../models/role';
const router = express.Router();
router.post(
  '/users/new/role',
  [
    body('name').not().isEmpty().withMessage('Role name must be provided'),
    body('systemName')
      .not()
      .isEmpty()
      .withMessage('System name must be provided'),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.RoleCreate]),
  RoleControllers.newRole
);
router.get(
  '/users/roles',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.RoleRead]),
  RoleControllers.readAll
);
router.get('/users/roles/:roleId', requireAuth, RoleControllers.readOne);
router.patch(
  '/users/update/role/:id',
  [body('name').not().isEmpty().withMessage('Role name must be provided')],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.RoleUpdate]),
  RoleControllers.updateRole
);
router.patch(
  '/users/role/:id',
  requireAuth,
  requireType([UserType.Customer]),
  requirePermission([ListPermission.RoleDelete]),
  RoleControllers.deleteRole
);
router.get(
  '/users/account-role/:accountId',
  requireAuth,
  RoleControllers.readRoleOfAccount
);
export { router as roleRouter };
