import { requireAuth, validationRequest } from '@share-package/common';
import express, { Request, Response } from 'express';
import { CartController } from '../controllers/cart.controller';
import { body } from 'express-validator';
import mongoose from 'mongoose';
const router = express.Router();
router.post(
  '/cart/add',
  [
    body('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be type Integer and greater than or equal 1'),
    body('productId').isMongoId().withMessage('Product Id must be ObjectId'),
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
      .withMessage('Quantity must be type Integer and greater than or equal 1'),
    body('cartAttr.*.productId')
      .isMongoId()
      .withMessage('ProductId must be ObjectId'),
  ],
  validationRequest,
  requireAuth,
  CartController.updateCart
);
router.patch(
  '/cart/delete',
  [
    body('productIds').isArray().withMessage('ProductIds must be an array'),
    body('productIds.*').custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid ObjectID');
      }
      return true;
    }),
  ],
  requireAuth,
  CartController.deleteProducts
);
export { router as cartRouter };
