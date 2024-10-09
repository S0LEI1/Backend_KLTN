import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { ManagerControllers } from '../controllers/manager.controllers';
import { AccountControllers } from '../controllers/account.controllers';
import { body } from 'express-validator';
import { NAME_MESSAGE } from '../utils/message';
const router = express.Router();
router.get(
  '/accounts/manager/',
  requireAuth,
  requireType([UserType.Manager, UserType.Employee]),
  requirePermission([ListPermission.EmployeeRead, ListPermission.CustomerRead]),
  ManagerControllers.readUserProfiles
);
router.get(
  '/accounts/manager/:id',
  requireAuth,
  requireType([UserType.Manager, UserType.Employee]),
  requirePermission([ListPermission.EmployeeRead, ListPermission.CustomerRead]),
  ManagerControllers.userProfile
);
router.patch(
  '/accounts/manager/:id',
  requireAuth,
  requireType([UserType.Manager, UserType.Employee]),
  requirePermission([
    ListPermission.EmployeeUpdate,
    ListPermission.CustomerUpdate,
  ]),
  ManagerControllers.updateUserProfile
);
router.delete(
  '/accounts/manager/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([
    ListPermission.EmployeeDelete,
    ListPermission.CustomerDelete,
  ]),
  ManagerControllers.deleteUser
);
router.get(
  '/accounts/manage/sort',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.EmployeeRead, ListPermission.CustomerRead]),
  ManagerControllers.readByType
);
router.get(
  '/accounts/manage/find',
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.CustomerRead, ListPermission.CustomerRead]),
  ManagerControllers.readByName
);
export { router as managerRouter };
