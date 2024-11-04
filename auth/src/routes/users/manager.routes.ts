import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { ManagerControllers } from '../../controllers/manager.controllers';
const router = express.Router();
router.get(
  '/users/manager/',
  requireAuth,
  requireType([UserType.Manager, UserType.Employee]),
  requirePermission([ListPermission.EmployeeRead, ListPermission.CustomerRead]),
  ManagerControllers.readAll
);
router.get(
  '/users/manager/:id',
  requireAuth,
  requireType([UserType.Manager, UserType.Employee]),
  requirePermission([ListPermission.EmployeeRead, ListPermission.CustomerRead]),
  ManagerControllers.userProfile
);
router.patch(
  '/users/manager/:id',
  requireAuth,
  requireType([UserType.Manager, UserType.Employee]),
  requirePermission([
    ListPermission.EmployeeUpdate,
    ListPermission.CustomerUpdate,
  ]),
  ManagerControllers.updateUserProfile
);
router.delete(
  '/users/manager/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([
    ListPermission.EmployeeDelete,
    ListPermission.CustomerDelete,
  ]),
  ManagerControllers.deleteUser
);
router.get(
  '/users/manage/sort',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.EmployeeRead, ListPermission.CustomerRead]),
  ManagerControllers.readByType
);
router.get(
  '/users/manage/findbyname',
  validationRequest,
  requireAuth,
  requireType([UserType.Manager, UserType.Employee]),
  requirePermission([ListPermission.CustomerRead, ListPermission.CustomerRead]),
  ManagerControllers.readByName
);
export { router as managerRouter };
