import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validationRequest, BadRequestError } from '@share-package/common';
import jwt from 'jsonwebtoken';

import { Password } from '../services/password';
import { AccountRole } from '../models/account-role-mapping';
import { RolePermission } from '../models/role-permission';
import { Account } from '../models/account';
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
    const existingAccount = await Account.findOne({ email });
    if (!existingAccount) {
      throw new BadRequestError('Invalid credentitals');
    }
    const passwordMatch = await Password.compare(
      existingAccount.password,
      password
    );
    if (!passwordMatch) {
      throw new BadRequestError('Password not match');
    }
    const accountRole = await AccountRole.checkRoleByAccountId(
      existingAccount.id
    );
    const rolePs = await RolePermission.checkPermissionByRoleId(
      accountRole!.role.id
    );

    // Genarate JWT
    const userJWT = jwt.sign(
      {
        id: existingAccount.id,
        email: existingAccount.email,
        type: existingAccount.type,
        permissions: rolePs,
      },
      process.env.JWT_KEY!
    );

    // store jwt

    req.session = {
      jwt: userJWT,
    };
    res.status(200).send({
      token: userJWT,
      permissions: rolePs,
      type: existingAccount.type,
    });
  }
);

export { router as signinRouter };
