import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { PackageServiceControllers } from '../controllers/package-service.controllers';
import { body } from 'express-validator';
const router = express.Router();
router.post(
  '/services/package-service/new',
  [
    body('packageId')
      .notEmpty()
      .isMongoId()
      .withMessage('Package Id must be MongoId'),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.PackageCreate]),
  PackageServiceControllers.newPackageService
);
// router.post(
//   '/services/package-service/delete',
//   [body('packageId').isMongoId().withMessage('Package Id must be mongoId')],
//   validationRequest,
//   requireAuth,
//   requireType([UserType.Manager]),
//   requirePermission([ListPermission.PackageDelete]),
//   PackageServiceControllers.deletePackageService
// );
export { router as packageServiceRouter };
