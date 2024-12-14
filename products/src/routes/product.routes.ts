import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { CODE_MESSAGE, NAME_MESSAGE } from '../utils/message';
import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
  singleUploadMiddleware,
  validationRequest,
  codeRegex,
  currentUser,
} from '@share-package/common';
import { ProductControllers } from '../controllers/product.controllers';

const router = express.Router();
router.post(
  '/products/manage/new',
  singleUploadMiddleware,
  [
    body('name').notEmpty().withMessage(`Product ${NAME_MESSAGE}`),
    body('categoryId')
      .notEmpty()
      .isMongoId()
      .withMessage('Category Id must be valid'),
    body('suplierId')
      .notEmpty()
      .isMongoId()
      .withMessage('Suplier Id must be valid'),
    body('expire')
      .notEmpty()
      .isISO8601()
      .toDate()
      .withMessage('Expire must be valid'),
    body('costPrice')
      .notEmpty()
      .isFloat({ min: 1000 })
      .withMessage('Cost price must be greater than equal 1000đ'),
    body('quantity')
      .notEmpty()
      .isFloat({ min: 1, max: 999 })
      .withMessage('Quanity must be greater than equal 1'),
    body('code').notEmpty().matches(codeRegex).withMessage(CODE_MESSAGE),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductCreate]),
  ProductControllers.new
);
router.get('/products/', ProductControllers.readAll);
router.get(
  '/products/:id',
  // requireType([UserType.Manager, UserType.Employee]),
  // requirePermission(ListPermission.ProductRead),
  ProductControllers.readOne
);
router.patch(
  '/products/manage/:id',
  singleUploadMiddleware,
  [
    body('name').notEmpty().withMessage(`Product ${NAME_MESSAGE}`),
    body('categoryId')
      .notEmpty()
      .isMongoId()
      .withMessage('Category Id must be valid'),
    body('suplierId')
      .notEmpty()
      .isMongoId()
      .withMessage('Suplier Id must be valid'),
    body('expire')
      .notEmpty()
      .isISO8601()
      .toDate()
      .withMessage('Expire must be valid'),
    body('costPrice')
      .notEmpty()
      .isFloat({ min: 1000 })
      .withMessage('Cost price must be greater than equal 1000đ'),
    body('quantity')
      .notEmpty()
      .isFloat({ min: 1, max: 999 })
      .withMessage('Quanity must be greater than equal 1'),
    body('code').notEmpty().matches(codeRegex).withMessage(CODE_MESSAGE),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductUpdate]),
  ProductControllers.update
);
router.patch(
  '/products/manage/disable/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductUpdate]),
  ProductControllers.disable
);
router.get(
  '/products/sortBy/:id',
  requireAuth,
  // requireType([UserType.Manager]),
  // requirePermission(ListPermission.ProductRead),
  ProductControllers.sortByCategoryOrSuplier
);
router.get(
  '/products/find/name',
  validationRequest,
  ProductControllers.readAllByName
);
router.get(
  '/products/manage/unactive/',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductRead]),
  ProductControllers.readAllProductUnactive
);
router.get(
  '/products/export/data',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductRead]),
  ProductControllers.exportData
);
router.post(
  '/products/import/data',
  singleUploadMiddleware,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductCreate]),
  ProductControllers.importData
);
router.patch(
  '/products/add/quantity/:id',
  [
    body('quantity')
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage('Add quantity must be type Integer greater than or equal 1'),
    body('costPrice')
      .notEmpty()
      .isInt({ min: 1000 })
      .withMessage(
        'Add quantity must be type Integer and greater than or equal 1000đ'
      ),
  ],
  validationRequest,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductCreate]),
  ProductControllers.addQuantity
);
export { router as productRouter };
