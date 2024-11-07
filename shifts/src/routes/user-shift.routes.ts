import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { UserShiftControllers } from '../controllers/user-shift.controllers';
import { body } from 'express-validator';
const router = express.Router();
router.post(
  '/shifts/user-shift/new',
  [
    body('empId').isMongoId().withMessage('Employee Id must be ObjectId'),
    body('shiftId').isMongoId().withMessage('Shift Id must be ObjectId'),
    body('date')
      .isISO8601()
      .withMessage('Date must be in ISO 8601 format')
      .custom((value) => {
        const inputDate = new Date(value);
        const currentDate = new Date();
        if (inputDate.getDate() < currentDate.getDate()) {
          throw new Error('Date must not be earlier than today');
        }
        return true;
      }),
  ],
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.UserShiftCreate]),
  UserShiftControllers.newUS
);
router.get(
  '/shifts/user-shift/all',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.UserShiftRead]),
  UserShiftControllers.readAll
);
router.get(
  '/shifts/user-shift/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.UserShiftRead]),
  UserShiftControllers.readOne
);
export { router as userShiftRoutes };
