import { requireAuth, validationRequest } from '@share-package/common';
import express, { Request, Response } from 'express';
import { RolePermissionControllers } from '../../controllers/role-permission.controller';
import { body } from 'express-validator';
const router = express.Router();
router.post(
  '/users/role-permission/',
  [
    body('roleId').isMongoId().withMessage('Role Id must be mongoId'),
    body('permissionIds')
      .isMongoId()
      .withMessage('Permission Id must be mongoId'),
  ],
  validationRequest,
  requireAuth,
  RolePermissionControllers.addPermissionForRole
);
router.post(
  '/users/role-permission/delete',
  [
    body('roleId').isMongoId().withMessage('Role Id must be mongoId'),
    body('permissionIds')
      .isMongoId()
      .withMessage('Permission Id must be mongoId'),
  ],
  validationRequest,
  requireAuth,
  RolePermissionControllers.removePermissionForRole
);
export { router as rolePermissionRouter };
