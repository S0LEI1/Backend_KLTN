import express, { Request, Response } from 'express';
import { MailControllers } from '../controllers/mail.controllers';
import { validationRequest } from '@share-package/common';
import { body } from 'express-validator';
import { EMAIL_MESSAGE } from '../utils/message';
const router = express.Router();
router.post(
  '/accounts/otp',
  [body('email').isEmail().withMessage(EMAIL_MESSAGE)],
  validationRequest,
  MailControllers.sendOtp
);
export { router as mailRouter };
