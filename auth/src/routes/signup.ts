import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { BadRequestError, validationRequest } from '@m-auth/common';

const router = express.Router();
const PASSWORD_ERR =
  'Password must contain one digit from 1 to 9, one lowercase letter, one uppercase letter, one special character, no space, and it must be 8-16 characters long.';
router.post(
  '/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/)
      .withMessage(PASSWORD_ERR),
    body('fullName').not().isEmpty().withMessage('Full name must be provided'),
    body('gender').not().isEmpty().withMessage('Gender must be provided'),
  ],

  // middleware validationRequest
  validationRequest,
  async (req: Request, res: Response) => {
    const { email, password, fullName, gender } = req.body;

    const existsUser = await User.findOne({ email });
    if (existsUser) {
      throw new BadRequestError('Email in use');
    }

    const user = User.build({ email, password, fullName, gender });
    await user.save();

    // Genarate JWT

    const userJWT = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    // store jwt

    req.session = {
      jwt: userJWT,
    };

    res.status(201).send(user);

    // new User({ email, password })
  }
);

export { router as signupRouter };
