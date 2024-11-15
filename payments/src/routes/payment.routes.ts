import { requireAuth } from '@share-package/common';
import express, { Request, Response } from 'express';
import { PaymentControllers } from '../controllers/payments.controller';
const router = express.Router();
router.post('/payments/:orderId', requireAuth, PaymentControllers.payment);
export { router as paymentRouter };
