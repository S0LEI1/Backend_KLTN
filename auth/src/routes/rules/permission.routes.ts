import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { PermissionControllers } from '../../controllers/permission.controllers';
const router = express.Router();
router.get(
  '/users/permissions/',
  requireAuth,
  // requireType([UserType.Manager]),
  // requirePermission([ListPermission.RolePermissionRead]),
  PermissionControllers.readAll
);
router.get(
  '/users/permissions/:roleId',
  requireAuth,
  PermissionControllers.readPermissionByRoleId
);
export { router as permissionRouter };
