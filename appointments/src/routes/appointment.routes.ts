import { requireAuth, validationRequest } from '@share-package/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { AppointmentController } from '../controllers/appointment.controller';
const router = express.Router();
router.post(
  '/appointments/new',
  [
    body('customerId').isMongoId().withMessage('Customer Id must be ObjectId'),
    body('dateTime').isISO8601().withMessage('Date time must be type ISO8601'),
    body('branchId').isMongoId().withMessage('Customer Id must be ObjectId'),
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
export { router as AppointmentRouter };
