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
    body('price').isNumeric().withMessage('Price must be number'),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ServiceCreate]),
  ServiceControllers.new
);
router.get('/services/', requireAuth, ServiceControllers.readAll);
router.get('/services/:id', requireAuth, ServiceControllers.readOne);

export { router as servicesRouter };
