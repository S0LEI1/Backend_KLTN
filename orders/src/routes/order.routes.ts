import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { OrderController } from '../controllers/order.controller';
import { body } from 'express-validator';
const router = express.Router();
router.post(
  '/orders/new',
  [body('customerId').isMongoId().withMessage('Customer Id must be ObjectId')],
  requireAuth,
  requireType([UserType.Employee, UserType.Manager]),
  requirePermission([ListPermission.OrderCreate]),
  OrderController.newOrder
);
router.get(
  '/orders',
  requireAuth,
  // requireType([UserType.Employee, UserType.Manager, User]),
  requirePermission([ListPermission.OrdersRead]),
  OrderController.readOrders
);
router.get(
  '/order/:id',
  requireAuth,
  requirePermission([ListPermission.OrdersRead]),
  OrderController.readOne
);
export { router as orderRouter };
