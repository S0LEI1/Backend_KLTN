import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validationRequest,
  BadRequestError,
  NotFoundError,
} from '@share-package/common';
import jwt from 'jsonwebtoken';
import { Password } from '../../services/password';
import { RolePermissionServices } from '../../services/role-permission.service';
import { User } from './../../models/user';
import { UserRole } from './../../models/user-role-mapping';
const router = express.Router();
const PASSWORD_ERR =
  'Password must contain one digit from 1 to 9, one lowercase letter, one uppercase letter, one special character, no space, and it must be 8-16 characters long.';
interface Lookup {
  id: string;
  systemName: string;
  permission: string[];
}
router.post(
  '/users/signin',
  [
    body('email').notEmpty().isEmail().withMessage('Email must be valid'),
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
    try {
      const existUser = await User.findOne({ email });
      if (!existUser) {
        throw new BadRequestError('Invalid credentitals');
      }
      const passwordMatch = await Password.compare(
        existUser.password,
        password
      );
      if (!passwordMatch) {
        throw new BadRequestError('Password not match');
      }
      const userRoles = await UserRole.find({
        user: existUser.id,
      });

      const roles: string[] = [];
      const permissions: string[] = [];
      for (const ur of userRoles) {
        const { role, systemNames } =
          await RolePermissionServices.readPermissionByAccountRole(ur);
        roles.push(role.systemName);
        permissions.push(...systemNames);
      }

      // Genarate JWT
      const userJWT = jwt.sign(
        {
          id: existUser.id,
          email: existUser.email,
          type: existUser.type,
          roles: roles,
          permissions: permissions,
          fullName: existUser.fullName,
          avatar: existUser.avatar,
          phoneNumer: existUser.phoneNumber,
          address: existUser.address,
        },
        process.env.JWT_KEY!,
        { expiresIn: '3h' }
      );

      // store jwt

      // req.session = {
      //   jwt: userJWT,
      // };
      res.status(200).send({
        token: userJWT,
        type: existUser.type,
        roles,
        permissions,
        avatar: existUser.avatar,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

export { router as signinRouter };
