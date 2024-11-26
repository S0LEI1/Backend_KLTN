import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
  validationRequest,
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
  OrderController.addAndDelete
);
router.patch(
  '/orders/delete/:orderId',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.OrderDelete]),
  OrderController.deleteOrder
);
router.patch(
  '/orders/add/usagelog',
  [
    body('orderId').isMongoId().withMessage('Order Id must be type ObjectId'),
    // body('packageId')
    //   .isMongoId()
    //   .withMessage('Package Id must be type ObjectId'),
    body('serviceId')
      .isMongoId()
      .withMessage('Service Id must be type ObjectId'),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Employee, UserType.Manager]),
  requirePermission([ListPermission.OrderUpdate]),
  OrderController.addUsageLog
);
router.get('/orders/exportPdf', OrderController.exportPdf);
export { router as orderRouter };
