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
  [
    body('begin').isISO8601().toDate().withMessage('Begin must be valid'),
    body('end').isISO8601().toDate().withMessage('End must be valid'),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ShiftCreate]),
  ShiftControllers.newShift
);
router.get(
  '/shifts/',
  requireAuth,
  requireType([UserType.Employee, UserType.Manager]),
  requirePermission([ListPermission.ShiftRead]),
  ShiftControllers.readAll
);
export { router as shiftRouter };
