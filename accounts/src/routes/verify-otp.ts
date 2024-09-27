import {
  BadRequestError,
  NotFoundError,
  UserType,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { getValue, redisClient } from '../services/redis';
import { body } from 'express-validator';
import { AccountCreatedPublisher } from '../events/publishers/account-created-publisher';
import { Account } from '../models/account';
import { natsWrapper } from '../nats-wrapper';
import { AccountRole } from '../models/account-role-mapping';

const router = express.Router();
router.post(
  '/accounts/verify',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Otp is invalid'),
  ],
  validationRequest,
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    const account = await Account.findOne({ email: email });
    if (!account) throw new NotFoundError('account');

    const storeOtp = await getValue(email);
    if (storeOtp === null) {
      throw new BadRequestError('Otp has expires');
    }
    if (otp !== storeOtp) {
      throw new BadRequestError('Invalid OTP');
    }
    await redisClient.del(email);
    const accountRole = await AccountRole.findOne({ account: account.id });
    if (!accountRole) {
      new AccountCreatedPublisher(natsWrapper.client).publish({
        id: account.id,
        email: account.email,
        password: account.password,
        type:
          account.type === UserType.Customer
            ? UserType.Customer
            : account.type === UserType.Employee
            ? UserType.Employee
            : UserType.Manager,
      });
      return res.status(200).json({ 'verify-account': 'success' });
    }
    res.status(200).json({ verify: true });
  }
);

export { router as verifyRouter };
