import express, { Request, Response } from 'express';
import {
  BadRequestError,
  validationRequest,
  getOtp,
  templateOtp,
  SendMail,
} from '@share-package/common';
import { body } from 'express-validator';
import { User } from '../models/user';
import { Mail } from '../services/send-mail';
import { Account } from '../models/account';

const router = express.Router();
const SUBJECT = 'Đây là mã OTP của bạn';
router.post(
  '/accounts/otp',
  [body('email').isEmail().withMessage('Email must be valid')],
  validationRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const account = await Account.findOne({ email: email });
    if (!account) {
      throw new BadRequestError('Email does not exists');
    }
    const otp = getOtp(6, true, false, false, false);
    const html = templateOtp.getOtpHtml(otp, Number(process.env.OTP_TIME));
    await Mail.send(email, otp, html, `${SUBJECT} ${otp}`);
    res.status(200).send({ otp: otp });
  }
);

export { router as sendOtpRouter };
