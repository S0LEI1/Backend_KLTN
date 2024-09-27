import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import {
  BadRequestError,
  UserType,
  validationRequest,
} from '@share-package/common';
import { Mail } from '../services/send-mail';
import { Account } from '../models/account';
import { getOtp, templateOtp } from '@share-package/common';

const router = express.Router();
const OTP_TIME = 5;
const PASSWORD_ERR =
  'Password must contain one digit from 1 to 9, one lowercase letter, one uppercase letter, one special character, no space, and it must be 8-16 characters long.';
router.post(
  '/accounts/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/)
      .withMessage(PASSWORD_ERR),
    body('confirmPassword')
      .trim()
      .notEmpty()
      .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/)
      .withMessage(PASSWORD_ERR),
    body('confirmPassword').custom(async (confirmPassword, { req }) => {
      const { password } = req.body;
      if (password != confirmPassword) {
        throw new BadRequestError('Password do not match');
      }
    }),
    body('fullName').not().isEmpty().withMessage('Full name must be provided'),
    body('gender').not().isEmpty().withMessage('Gender must be provided'),
    body('phoneNumber')
      .isMobilePhone('vi-VN')
      .withMessage('Phone number must be 10 number'),
    body('address').not().isEmpty().withMessage('Address must be provided.'),
  ],
  // middleware validationRequest
  validationRequest,
  async (req: Request, res: Response) => {
    const { email, password, fullName, gender, phoneNumber, address } =
      req.body;
    try {
      const existAccount = await Account.findOne({ email: email });
      if (existAccount) throw new BadRequestError('Email is used');
      const existsUser = await User.findOne({ phoneNumber: phoneNumber });
      if (existsUser) {
        throw new BadRequestError('Phone number is used');
      }
      const account = Account.build({
        email: email,
        password: password,
        type: UserType.Customer,
      });
      await account.save();
      const user = User.build({
        fullName,
        gender,
        phoneNumber,
        address,
        account: account.id,
      });
      await user.save();
      const otp = getOtp(6, true, false, false, false);
      const html = templateOtp.getOtpHtml(otp, Number(process.env.OTP_TIME));
      await Mail.send(
        email,
        otp,
        html,
        '`Chào mừng bạn đến với Kim Beauty Spa`'
      );
      res.status(201).send({ otp: otp });
    } catch (error) {
      console.log(error);
    }
    // new User({ email, password })
  }
);

export { router as signupRouter };
