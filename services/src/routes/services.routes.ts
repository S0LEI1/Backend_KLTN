import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
  singleUploadMiddleware,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ServiceControllers } from '../controllers/service.controllers';
const router = express.Router();
router.post(
  '/services/manage/new',
  singleUploadMiddleware,
  [
    body('name').notEmpty().withMessage('Name service must be provided'),
    body('costPrice').isNumeric().withMessage('Price must be number'),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ServiceCreate]),
  ServiceControllers.new
);
router.get('/services/', requireAuth, ServiceControllers.readAll);
router.get('/services/:id', requireAuth, ServiceControllers.readOne);
router.patch(
  '/services/:id',
  singleUploadMiddleware,
  [
    body('name').notEmpty().withMessage('Service name must be provided'),
    body('costPrice').isNumeric().withMessage('Cost price must be numeric'),
    body('discount').isNumeric().withMessage('Discount must be numeric'),
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

export { router as servicesRouter };
