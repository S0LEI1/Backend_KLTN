import {
  BadRequestError,
  currentUser,
  requireAuth,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { natsWrapper } from '../nats-wrapper';
import { createClient } from 'redis';
import { getValue, redisClient } from '../services/redis';
import { body } from 'express-validator';

const router = express.Router();
router.post(
  '/users/verify',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Otp is invalid'),
  ],
  validationRequest,
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    // const client = await createClient()
    //   .on('error', (err) => console.log('Redis Client Error', err))
    //   .connect();

    const storeOtp = await getValue(email);

    if (storeOtp === null) {
      throw new BadRequestError('Otp has expires');
    }
    if (otp !== storeOtp) {
      throw new BadRequestError('Invalid OTP');
    }
    await redisClient.del(email);

    res.status(200).json({ success: true });
  }
);

export { router as verifyRouter };
