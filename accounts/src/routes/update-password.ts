import {
  BadRequestError,
  NotFoundError,
  UserType,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Password } from '../services/password';
import { Account } from '../models/account';
import { AccountUpdatedPublisher } from '../events/publishers/account-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();
const PASSWORD_ERR =
  'Password must contain one digit from 1 to 9, one lowercase letter, one uppercase letter, one special character, no space, and it must be 8-16 characters long.';

router.patch(
  '/accounts',
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
  ],
  validationRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const account = await Account.findOne({ email: email });
    if (!account) {
      throw new NotFoundError('Account');
    }
    const passwordMatch = await Password.compare(account.password, password);
    if (passwordMatch) {
      throw new BadRequestError('Password is used');
    }
    account.set({ password: password });
    await account.save();
    // publish user update event
    new AccountUpdatedPublisher(natsWrapper.client).publish({
      id: account.id,
      email: account.email,
      password: account.password,
      type:
        account.type === UserType.Customer
          ? UserType.Customer
          : account.type === UserType.Employee
          ? UserType.Employee
          : UserType.Manager,
      version: account.version,
    });
    res.status(200).send({ update: true });
  }
);

export { router as updatePasswordRouter };
