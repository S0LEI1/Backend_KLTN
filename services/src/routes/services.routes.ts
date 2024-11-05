import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
  singleUploadMiddleware,
  validationRequest,
  codeRegex,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ServiceControllers } from '../controllers/service.controllers';
const CODE_MESSAGE =
  'Password must contain digit from 1 to 9, uppercase letter, no space, and it must be 3-7 characters long.';

const router = express.Router();
router.post(
  '/services/manage/new',
  singleUploadMiddleware,
  [
    body('name').notEmpty().withMessage('Name service must be provided'),
    body('costPrice').isNumeric().withMessage('Price must be number'),
    body('time')
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage('Time must be greater than equal 1 min'),
    body('expire')
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage('Time must be greater than equal 1 day'),
    body('code').notEmpty().matches(codeRegex).withMessage(CODE_MESSAGE),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ServiceCreate]),
  ServiceControllers.new
);
router.get('/services/', ServiceControllers.readAll);
router.get('/services/:id', ServiceControllers.readOne);
router.patch(
  '/services/:id',
  singleUploadMiddleware,
  [
    body('name').notEmpty().withMessage('Name service must be provided'),
    body('costPrice').isNumeric().withMessage('Price must be number'),
    body('time')
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage('Time must be greater than equal 1 min'),
    body('expire')
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage('Time must be greater than equal 1 day'),
    body('discount').isNumeric().withMessage('Discount must be numeric'),
    body('code').notEmpty().matches(codeRegex).withMessage(CODE_MESSAGE),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ServiceUpdate]),
  ServiceControllers.updateService
);
router.patch(
  '/services/delete/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ServiceDelete]),
  ServiceControllers.deleteService
);

router.get('/services/find/name', requireAuth, ServiceControllers.readByName);
router.get(
  '/services/export/data',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ServiceCreate]),
  ServiceControllers.exportService
);
router.post(
  '/services/import/data',
  singleUploadMiddleware,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ServiceCreate]),
  ServiceControllers.importService
);
export { router as servicesRouter };
