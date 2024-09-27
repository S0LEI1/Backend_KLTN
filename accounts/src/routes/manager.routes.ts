import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { ManagerControllers } from '../controllers/manager.controllers';
const router = express.Router();
router.get(
  '/accounts/manager/',
  requireAuth,
  requireType([UserType.Manager, UserType.Employee]),
  requirePermission(ListPermission.EmployeeRead),
  ManagerControllers.readUserProfiles
);
router.get(
  '/accounts/manager/:id',
  requireAuth,
  requireType([UserType.Manager, UserType.Employee]),
  requirePermission(ListPermission.EmployeeRead),
  ManagerControllers.userProfile
);
router.patch(
  '/accounts/manager/:id',
  requireAuth,
  requireType([UserType.Manager, UserType.Employee]),
  requirePermission(ListPermission.EmployeeRead),
  ManagerControllers.updateUserProfile
);
export { router as managerRouter };
