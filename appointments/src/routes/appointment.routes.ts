import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { AppointmentController } from '../controllers/appointment.controller';
const router = express.Router();
router.post(
  '/appointments/new',
  [
    // body('customerId').isMongoId().withMessage('Customer Id must be ObjectId'),
    body('dateTime')
      .notEmpty()
      .isISO8601()
      .withMessage('Date time must be type ISO8601'),
    body('branchId')
      .notEmpty()
      .isMongoId()
      .withMessage('Branch Id must be ObjectId'),
    body('consultantId')
      .isMongoId()
      .withMessage('Consultant Id must be ObjectId'),
    // body('orderId').isMongoId().withMessage('Order Id must be ObjectId'),
    // body('serviceAttrs').isArray().withMessage('ServiceAttrs must be array'),
    body('serviceAttrs.*.serviceId')
      .isMongoId()
      .withMessage('Id in serviceAttrs must be ObjectId'),
    body('serviceAttrs.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity in serviceAttrs must be greater than or equal 1'),
    body('packageAttrs.*.packageId')
      .isMongoId()
      .withMessage('Id in packageAttrs must be ObjectId'),
    body('packageAttrs.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity in packageAttrs must be greater than or equal 1'),
  ],
  validationRequest,
  requireAuth,
  AppointmentController.newAppointment
);
router.get('/appointments', requireAuth, AppointmentController.getAppointments);
router.get(
  '/appointments/:id',
  requireAuth,
  AppointmentController.getAppointment
);
// router.post(
//   '/appointments/api/cancel/:appointmentId',
//   // requireAuth,
//   AppointmentController.cancelAppointment
// );
router.patch(
  '/appointments/delete/:appointmentId',
  requireAuth,
  AppointmentController.deleteAppointment
);
router.get(
  '/appointments/find/by',
  requireAuth,
  requireType([UserType.Employee, UserType.Manager]),
  AppointmentController.findAppointmentByNameOrPhone
);
router.patch(
  '/appointments/update/:appointmentId',
  [
    body('dateTime')
      .notEmpty()
      .isISO8601()
      .withMessage('Date time must be type ISO8601'),
    body('branchId')
      .notEmpty()
      .isMongoId()
      .withMessage('Branch Id must be ObjectId'),
    body('consultantId')
      .isMongoId()
      .withMessage('Consultant Id must be ObjectId'),
    // body('serviceAttrs').isArray().withMessage('ServiceAttrs must be array'),
    body('serviceAttrs.*.serviceId')
      .isMongoId()
      .withMessage('ServiceId in serviceAttrs must be ObjectId'),
    body('serviceAttrs.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity in serviceAttrs must be greater than or equal 1'),
    body('packageAttrs.*.packageId')
      .isMongoId()
      .withMessage('PackageId in packageAttrs must be ObjectId'),
    body('packageAttrs.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity in packageAttrs must be greater than or equal 1'),
  ],
  validationRequest,
  requireAuth,
  AppointmentController.updateAppointment
);
router.patch(
  '/appointments/complete/:id',
  requireAuth,
  requireType([UserType.Employee, UserType.Manager]),
  AppointmentController.completeAppointment
);
export { router as AppointmentRouter };

router.post(
  '/appointments/cancel/:id',
  AppointmentController.cancelAppointment
);
