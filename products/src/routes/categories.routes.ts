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
import { CategoriesServices } from '../services/categories.service';
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
router.get(
  '/products/categories',
  requireAuth,
  requireType([UserType.Employee, UserType.Manager]),
  requirePermission([ListPermission.ProductRead]),
  CategoriesControllers.readAll
);
router.get(
  '/products/category/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductRead]),
  CategoriesControllers.readOne
);
router.get(
  '/products/category',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductRead]),
  CategoriesControllers.findByName
);
router.patch(
  '/products/category/:id',
  [body('name').not().isEmpty().withMessage(`Category ${NAME_MESSAGE}`)],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductRead]),
  CategoriesControllers.update
);
router.delete(
  '/products/category/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductRead]),
  CategoriesControllers.delete
);
export { router as categoriesRouter };
