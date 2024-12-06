import { requireAuth, validationRequest } from '@share-package/common';
import express, { Request, Response } from 'express';
import { CartController } from '../controllers/cart.controller';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { AddType } from '../services/cart.service';
const router = express.Router();
router.post(
  '/cart/add',
  [
    body('item.quantity')
      .isInt({ min: 1 })
      .notEmpty()
      .withMessage('Quantity must be type Integer and greater than or equal 1'),
    body('item.id')
      .notEmpty()
      .isMongoId()
      .withMessage('Item Id must be ObjectId'),
    body('type')
      .notEmpty()
      .isIn(Object.values(AddType))
      .withMessage('Type must be: product, service, package'),
  ],
  validationRequest,
  requireAuth,
  CartController.add
);
router.get('/cart', requireAuth, CartController.getProductInCart);
router.patch(
  '/cart/update',
  [
    body('cartAttr').isArray().withMessage('CartAttr must be array'),
    body('cartAttr.*.quantity')
      .isInt()
      .notEmpty()
      .withMessage('Quantity must be type Integer and greater than or equal 1'),
    body('cartAttr.*.id')
      .notEmpty()
      .isMongoId()
      .withMessage('ItemId must be ObjectId'),
  ],
  validationRequest,
  requireAuth,
  CartController.updateCart
);
router.patch(
  '/cart/delete',
  [
    body('ids').isArray().withMessage('ProductIds must be an array'),
    body('ids.*').custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid ObjectID');
      }
      return true;
    }),
  ],
  requireAuth,
  CartController.deleteItems
);
export { router as cartRouter };
