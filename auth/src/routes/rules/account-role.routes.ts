import {
  ListPermission,
  UserType,
  currentUser,
  requireAuth,
  requirePermission,
  requireType,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { AccountRoleControllers } from '../../controllers/user-role.controller';
import { body } from 'express-validator';
const router = express.Router();
router.post(
  '/users/account-role/new',
  [
    body('accountId').isMongoId().withMessage('Account Id must be valid'),
    body('roleIds').isMongoId().withMessage('Role Id must be valid'),
  ],
  // requireAuth,
  // requireType([UserType.Manager]),
  // requirePermission([ListPermission.RoleCreate]),
  AccountRoleControllers.newACR
);
router.post(
  '/users/account-role/delete',
  [
    body('accountId').isMongoId().withMessage('Account Id must be valid'),
    body('roleIds').isMongoId().withMessage('Role Id must be valid'),
  ],
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.RoleDelete]),
  AccountRoleControllers.deleteACR
);
export { router as accountRoleRouter };
