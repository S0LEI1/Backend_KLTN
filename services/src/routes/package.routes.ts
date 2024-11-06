import {
  ListPermission,
  UserType,
  codeRegex,
  multipleUploadMiddleware,
  requireAuth,
  requirePermission,
  requireType,
  singleUploadMiddleware,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { PackageControllers } from '../controllers/package.controllers';
const CODE_MESSAGE =
  'Password must contain digit from 1 to 9, uppercase letter, no space, and it must be 3-7 characters long.';

const router = express.Router();
router.post(
  '/services/package/new',
  singleUploadMiddleware,
  [
    body('name')
      .notEmpty()
      .withMessage('Package service name must be provided'),
    body('costPrice')
      .isFloat({ min: 5000 })
      .withMessage('Cost price must be greater than 5000VND'),
    body('count')
      .isFloat({ min: 1 })
      .withMessage('Count must be greater than equal 1'),
    body('time')
      .isFloat({ min: 5 })
      .withMessage('Time must be greater than equal 5 minute'),
    body('code').notEmpty().matches(codeRegex).withMessage(CODE_MESSAGE),
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
router.patch(
  '/services/packages/update/:id',
  singleUploadMiddleware,
  [
    body('name')
      .notEmpty()
      .withMessage('Package service name must be provided'),
    body('costPrice')
      .isFloat({ min: 5000 })
      .withMessage('Cost price must be greater than 5000VND'),
    body('count')
      .isFloat({ min: 1 })
      .withMessage('Count must be greater than equal 1'),
    body('expire')
      .isFloat({ min: 5 })
      .withMessage('Expire must be greater than equal 1 day'),
    body('code').notEmpty().matches(codeRegex).withMessage(CODE_MESSAGE),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.PackageUpdate]),
  PackageControllers.updatePackage
);
router.get(
  '/services/package/export/data',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.PackageRead]),
  PackageControllers.exportPackage
);
export { router as packageRouter };
