import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NAME_MESSAGE } from '../utils/message';
import { SuplierControllers } from '../controllers/suplier.controllers';
const router = express.Router();
router.post(
  '/products/suplier',
  [body('name').not().isEmpty().withMessage(`Suplier ${NAME_MESSAGE}`)],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductCreate]),
  SuplierControllers.new
);
router.get('/products/supliers', SuplierControllers.readAll);
router.get('/products/suplier/:id', SuplierControllers.readOne);
router.get('/products/suplier', SuplierControllers.findByName);
router.patch(
  '/products/suplier/:id',
  [body('name').not().isEmpty().withMessage(`Suplier ${NAME_MESSAGE}`)],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductUpdate]),
  SuplierControllers.update
);
router.patch(
  '/products/suplier/delete/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductDelete]),
  SuplierControllers.delete
);
export { router as suplierRouter };
