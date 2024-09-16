import express, { Request, Response } from 'express';
import { User } from '../models/user';
import { BadRequestError, validationRequest } from '@share-package/common';
import { Mail } from '../services/send-mail';
import { body } from 'express-validator';

const router = express.Router();

router.post(
  '/user/otp',
  [body('email').isEmail().withMessage('Email must be valid')],
  validationRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new BadRequestError('Email does not exists');
    }
    const otp = await Mail.send(email);
    res.status(200).send({ otp: otp });
  }
);

export { router as sendOtpRouter };
