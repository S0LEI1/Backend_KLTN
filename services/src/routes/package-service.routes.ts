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
    body('serviceId').isMongoId().withMessage('Service Id must be MongoId'),
    body('packageId').isMongoId().withMessage('Package Id must be MongoId'),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.PackageCreate]),
  PackageServiceControllers.newPackageService
);
router.delete(
  '/services/package-service/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.PackageCreate]),
  PackageServiceControllers.deletePackageService
);
export { router as packageServiceRouter };
