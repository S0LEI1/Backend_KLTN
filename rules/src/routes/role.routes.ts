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
import { RoleControllers } from '../controllers/role.controllers';
import { Role } from '../models/role';
const router = express.Router();
router.post(
  '/rules/new/role',
  [
    body('name').not().isEmpty().withMessage('Role name must be provided'),
    body('systemName')
      .not()
      .isEmpty()
      .withMessage('System name must be provided'),
  ],
  validationRequest,
  requireAuth,
  // requireType([UserType.Manager]),
  // requirePermission([ListPermission.RoleCreate]),
  RoleControllers.newRole
);
router.get(
  '/rules/roles',
  requireAuth,
  // requireType([UserType.Manager]),
  // requirePermission([ListPermission.RoleRead]),
  RoleControllers.readAll
);
router.get('/rules/roles/:id', requireAuth, RoleControllers.readOne);
export { router as roleRouter };
