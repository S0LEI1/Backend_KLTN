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
    body('customerId').isMongoId().withMessage('Customer Id must be ObjectId'),
    body('dateTime').isISO8601().withMessage('Date time must be type ISO8601'),
    body('branchId').isMongoId().withMessage('Branch Id must be ObjectId'),
    body('consultantId')
      .isMongoId()
      .withMessage('Consultant Id must be ObjectId'),
    // body('serviceAttrs').isArray().withMessage('ServiceAttrs must be array'),
    body('serviceAttrs.*.id')
      .isMongoId()
      .withMessage('Id in serviceAttrs must be ObjectId'),
    body('serviceAttrs.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity in serviceAttrs must be greater than or equal 1'),
    body('packageAttrs.*.id')
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
router.patch(
  '/appointments/cancel/:appointmentId',
  requireAuth,
  AppointmentController.cancelAppointment
);
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
    body('dateTime').isISO8601().withMessage('Date time must be type ISO8601'),
    body('branchId').isMongoId().withMessage('Branch Id must be ObjectId'),
    body('consultantId')
      .isMongoId()
      .withMessage('Consultant Id must be ObjectId'),
    // body('serviceAttrs').isArray().withMessage('ServiceAttrs must be array'),
    body('serviceAttrs.*.id')
      .isMongoId()
      .withMessage('Id in serviceAttrs must be ObjectId'),
    body('serviceAttrs.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity in serviceAttrs must be greater than or equal 1'),
    body('packageAttrs.*.id')
      .isMongoId()
      .withMessage('Id in packageAttrs must be ObjectId'),
    body('packageAttrs.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity in packageAttrs must be greater than or equal 1'),
  ],
  validationRequest,
  requireAuth,
  AppointmentController.updateAppointment
);
export { router as AppointmentRouter };
