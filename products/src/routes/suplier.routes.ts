import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NAME_MESSAGE } from '../utils/message';
import { SuplierControllers } from '../controllers/suplier.controllers';
const router = express.Router();
router.post(
  '/products/suplier',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission(ListPermission.ProductCreate),
  [body('name').not().isEmpty().withMessage(`Suplier ${NAME_MESSAGE}`)],
  SuplierControllers.new
);
export { router as suplierRouter };
