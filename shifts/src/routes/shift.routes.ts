import {
  BadRequestError,
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { ShiftControllers } from '../controllers/shift.controllers';
import { body } from 'express-validator';
const router = express.Router();
router.post(
  '/shifts/new',
  [body('shiftOptions').notEmpty().withMessage('Begin must be provided')],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ShiftCreate]),
  ShiftControllers.newShift
);
router.get(
  '/shifts/',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ShiftRead]),
  ShiftControllers.readAll
);
router.get(
  '/shifts/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ShiftRead]),
  ShiftControllers.readOne
);
router.patch(
  '/shifts/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ShiftUpdate]),
  ShiftControllers.updateShift
);
export { router as shiftRouter };
