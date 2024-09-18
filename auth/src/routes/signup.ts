import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';
import { createClient } from 'redis';

import { templateHtml } from '../services/template-html';
import { User } from '../models/user';
import {
  BadRequestError,
  validationRequest,
  SendMail,
  UserRoleDetail,
  NotFoundError,
} from '@share-package/common';
import { UserCreatedPublisher } from '../events/publishers/user-created-publisher';
import { natsWrapper } from '../nats-wrapper';
import { setValue } from '../services/redis';
import { Mail } from '../services/send-mail';
import { UserRole } from '../models/user-role';
import { UserURMapping } from '../models/user-ur-mapping';
import { UserURMappingCreatedPublisher } from '../events/publishers/user-role-mapping-created-event';

const router = express.Router();
const OTP_TIME = 5;
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

    const existsUser = await User.findOne({ email });
    if (existsUser) {
      throw new BadRequestError('Email in use');
    }

    const user = User.build({
      email,
      password,
      fullName,
      gender,
      phoneNumber,
      address,
    });
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
    const otp = await Mail.send(user.email);
    const role = await UserRole.findOne({ name: UserRoleDetail.Customer });
    if (!role) throw new NotFoundError('Role');
    const userURM = UserURMapping.build({
      user: user.id,
      role: role.id,
    });
    await userURM.save();
    // Publish created event
    new UserCreatedPublisher(natsWrapper.client).publish({
      id: user.id,
      fullName: user.fullName,
      gender: user.gender,
      version: user.version,
    });
    //publish UserURMapping created event
    new UserURMappingCreatedPublisher(natsWrapper.client).publish({
      id: userURM.id,
      userId: userURM.user.id,
      roleId: userURM.role.id,
      version: userURM.version,
    });
    res.status(201).send({ otp: otp });

    // new User({ email, password })
  }
);

export { router as signupRouter };
