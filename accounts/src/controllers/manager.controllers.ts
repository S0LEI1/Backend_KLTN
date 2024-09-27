import express, { Request, Response } from 'express';
import { User } from '../models/user';
import { NotFoundError, UserType } from '@share-package/common';
import { AccountService } from '../services/account.service';
import { Account } from '../models/account';
import { AccountRole } from '../models/account-role-mapping';
import { Role } from '../models/role';
export class ManagerControllers {
  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    const user = await User.findUser(id);
    const account = await Account.findAccount(user!.account!.id);
    const accountRole = await AccountRole.findOne(account!.id);
    const role = Role.findById(accountRole!.role!.id);
    await User.deleteOne({ id });
    await Account.deleteOne(account!.id);
    await AccountRole.deleteOne(accountRole!.id);
    await Role.deleteOne(accountRole!.role.id);
  }
  static async updateUserProfile(req: Request, res: Response) {
    const { fullName, gender, phoneNumber, address } = req.body;
    const { id } = req.params;
    const user = await User.findUser(id);
    user!.set({
      fullName: fullName,
      gender: gender,
      phoneNumber: phoneNumber,
      address: address,
    });
    await user!.save();
    res
      .status(200)
      .send({ message: 'PATCH: update user profile successfully', user });
  }
  static async readUserProfiles(req: Request, res: Response) {
    const { type, pages = 1 } = req.query;
    const perPage = 25;
    try {
      const totalItems = await User.find().countDocuments();
      const users = await AccountService.pagination(
        totalItems,
        parseInt(pages as string)
      );
      const userFilter = users.filter((user) => user.account!.type === type);
      res
        .status(200)
        .send({ message: 'GET: user successfully', userFilter, totalItems });
    } catch (error) {
      console.log(error);
    }
  }
  static async userProfile(req: Request, res: Response) {
    const { id } = req.params;
    const user = await User.findById(id).populate('account');
    if (!user) throw new NotFoundError('User');
    res.status(200).send({
      message: 'GET: user profile successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        avatar: user.avatar,
        gender: user.gender,
        address: user.address,
        account: {
          id: user.account!.id,
          email: user.account!.email,
          type: user.account!.type,
        },
      },
    });
  }
}
