import {
  ListPermission,
  UserType,
  multipleUploadMiddleware,
  requireAuth,
  requirePermission,
  requireType,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { PackageControllers } from '../controllers/package.controllers';
const router = express.Router();
router.post(
  '/services/package/new',
  multipleUploadMiddleware,
  [
    body('name')
      .notEmpty()
      .withMessage('Package service name must be provided'),
    body('costPrice')
      .isFloat({ min: 5000 })
      .withMessage('Cost price must be greater 5000VND'),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.PackageCreate]),
  PackageControllers.newPackage
);
router.get('/services/packages/all', requireAuth, PackageControllers.readAll);
router.get('/services/package/:id', requireAuth, PackageControllers.readOne);
router.patch(
  '/services/package/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.PackageDelete]),
  PackageControllers.deletePackage
);
export { router as packageRouter };
