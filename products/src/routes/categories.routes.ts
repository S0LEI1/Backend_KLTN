import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { NAME_MESSAGE } from '../utils/message';
import { body } from 'express-validator';
import { CategoriesControllers } from '../controllers/categories.controllers';
const router = express.Router();
router.post(
  '/products/category',
  [body('name').not().isEmpty().withMessage(`Category ${NAME_MESSAGE}`)],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductCreate]),
  CategoriesControllers.new
);
router.get('/products/categories', CategoriesControllers.readAll);
router.get('/products/category/:id', CategoriesControllers.readOne);
router.get('/products/category', CategoriesControllers.findByName);
router.patch(
  '/products/category/:id',
  [body('name').not().isEmpty().withMessage(`Category ${NAME_MESSAGE}`)],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductUpdate]),
  CategoriesControllers.update
);
router.patch(
  '/products/category/delete/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductRead]),
  CategoriesControllers.delete
);
export { router as categoriesRouter };
