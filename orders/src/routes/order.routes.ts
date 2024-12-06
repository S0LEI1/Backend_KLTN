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
  [
    body('customerId')
      .notEmpty()
      .isMongoId()
      .withMessage('Customer Id must be ObjectId'),
    body('services.*.id')
      .isMongoId()
      .withMessage('Id in services must be ObjectId'),
    body('services.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity in service must be greater than or equal 1'),
    body('packages.*.id')
      .isMongoId()
      .withMessage('Id in packages must be ObjectId'),
    body('packages.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity in packages must be greater than or equal 1'),
    body('products.*.id')
      .isMongoId()
      .withMessage('Id in products must be ObjectId'),
    body('products.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity in products must be greater than or equal 1'),
  ],
  validationRequest,
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
// router.get(
//   '/orders/find/phone',
//   requireAuth,
//   requireType([UserType.Employee, UserType.Manager]),
//   requirePermission([ListPermission.OrdersRead]),
//   OrderController.findByUserPhone
// );
router.post(
  '/orders/add/:orderId',
  [
    body('services.*.id')
      .isMongoId()
      .withMessage('Id in services must be ObjectId'),
    body('services.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity in service must be greater than or equal 1'),
    body('packages.*.id')
      .isMongoId()
      .withMessage('Id in packages must be ObjectId'),
    body('packages.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity in packages must be greater than or equal 1'),
    body('products.*.id')
      .isMongoId()
      .withMessage('Id in products must be ObjectId'),
    body('products.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity in products must be greater than or equal 1'),
  ],
  validationRequest,
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
router.get('/orders/export/pdf', OrderController.exportPdf);
router.patch(
  '/orders/complete/:id',
  requireAuth,
  requireType([UserType.Employee, UserType.Manager]),
  requirePermission([ListPermission.OrderUpdate]),
  OrderController.completeOrder
);
export { router as orderRouter };
