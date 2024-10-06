import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validationRequest,
  BadRequestError,
  NotFoundError,
} from '@share-package/common';
import jwt from 'jsonwebtoken';
import mongoose, { ObjectId } from 'mongoose';
import { Password } from '../services/password';
import { AccountRole } from '../models/account-role-mapping';
import { RolePermission, RolePermissionDoc } from '../models/role-permission';
import { Account } from '../models/account';
import { RolePermissionServices } from '../services/role-permission.service';
import { Role, RoleDoc } from '../models/role';
import { Permission, PermissionDoc } from '../models/permission';
import { PermissionServices } from '../services/permission.service';
import { RoleServices } from '../services/roles.service';
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
    try {
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
      const accountRoles = await AccountRole.find({
        account: existingAccount.id,
      });
      const roles: string[] = [];
      const permissions: string[] = [];
      for (const acr of accountRoles) {
        const { role, systemNames } =
          await RolePermissionServices.readPermissionByAccountRole(acr);
        roles.push(role.systemName);
        permissions.push(...systemNames);
      }

      // for (let index = 0; index < accountRoles.length; index++) {
      //   const element = accountRoles[index];
      //   const role = await Role.findOne(
      //     {
      //       _id: element.role,
      //       isDeleted: false,
      //     },
      //     {
      //       description: 0,
      //       version: 0,
      //       isDeleted: 0,
      //       createdAt: 0,
      //       updatedAt: 0,
      //     }
      //   );
      //   if (role) {
      //     roles.push(role.systemName);
      //     const pms = await PermissionServices.readPermissionByRoleId(role.id);
      //     if (pms) pms.forEach((pm) => permissions.push(pm.systemName));
      //   }
      // }

      // const rolePs = await RolePermission.checkPermissionByRoleId(
      //   accountRole!.role.id
      // );

      // Genarate JWT
      const userJWT = jwt.sign(
        {
          id: existingAccount.id,
          email: existingAccount.email,
          type: existingAccount.type,
        },
        process.env.JWT_KEY!,
        { expiresIn: '3h' }
      );

      // store jwt

      req.session = {
        jwt: userJWT,
      };
      res.status(200).send({
        token: userJWT,
        type: existingAccount.type,
        roles,
        permissions,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

export { router as signinRouter };
