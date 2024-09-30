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
  requirePermission(ListPermission.ProductCreate),
  SuplierControllers.new
);
router.get(
  '/products/supliers',
  requireAuth,
  requireType([UserType.Employee, UserType.Manager]),
  requirePermission(ListPermission.ProductRead),
  SuplierControllers.readAll
);
router.get(
  '/products/suplier/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission(ListPermission.ProductRead),
  SuplierControllers.readOne
);
router.get(
  '/products/suplier',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission(ListPermission.ProductRead),
  SuplierControllers.findByName
);
router.patch(
  '/products/suplier/:id',
  [body('name').not().isEmpty().withMessage(`Suplier ${NAME_MESSAGE}`)],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission(ListPermission.ProductRead),
  SuplierControllers.update
);
router.delete(
  '/products/suplier/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission(ListPermission.ProductRead),
  SuplierControllers.delete
);
export { router as suplierRouter };
