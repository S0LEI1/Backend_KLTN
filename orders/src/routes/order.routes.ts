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
  // requireType([UserType.Employee, UserType.Manager]),
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
  '/orders/:id',
  requireAuth,
  requirePermission([ListPermission.OrdersRead]),
  OrderController.getOrder
);
router.patch(
  '/orders/cancel/:orderId',
  requireAuth,
  // requireType([UserType.Employee, UserType.Manager]),
  requirePermission([ListPermission.OrderDelete]),
  OrderController.cancelOrder
);
router.get(
  '/orders/find/phone',
  requireAuth,
  requireType([UserType.Employee, UserType.Manager]),
  requirePermission([ListPermission.OrdersRead]),
  OrderController.findByUserPhone
);
router.post(
  '/orders/add/:orderId',
  requireAuth,
  requirePermission([ListPermission.OrderCreate]),
  OrderController.add
);
export { router as orderRouter };
