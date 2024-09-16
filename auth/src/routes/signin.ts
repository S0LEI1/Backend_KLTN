import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validationRequest, BadRequestError } from '@share-package/common';
import jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { Password } from '../services/password';
import { getValue } from '../services/redis';
const router = express.Router();
const PASSWORD_ERR =
  'Password must contain one digit from 1 to 9, one lowercase letter, one uppercase letter, one special character, no space, and it must be 8-16 characters long.';
router.post(
  '/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/)
      .withMessage(PASSWORD_ERR),
  ],
  // catch middleware validation
  validationRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('Invalid credentitals');
    }
    const passwordMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordMatch) {
      throw new BadRequestError('Password not match');
    }

    const otp = await getValue(email);
    if (otp !== null) {
      throw new BadRequestError('Unverified account');
    }
    // Genarate JWT

    const userJWT = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    // store jwt

    req.session = {
      jwt: userJWT,
    };
    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
