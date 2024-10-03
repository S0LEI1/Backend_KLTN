import express, { Request, Response } from 'express';
import { User } from '../models/user';
import { NotFoundError, UserType } from '@share-package/common';
import { AccountService } from '../services/account.service';
import { Account } from '../models/account';
import { AccountRole } from '../models/account-role-mapping';
import { PublisherServices } from '../services/publisher.service';
import { Convert } from '../utils/convert';
export class ManagerControllers {
  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const user = await User.findUser(id);
      const account = await Account.findById(user!.account);
      if (!account) throw new NotFoundError('Account');
      const accountRole = await AccountRole.findOne({ account: account });
      await User.deleteOne({ _id: user!.id });
      await Account.deleteOne({ _id: account!.id });
      await AccountRole.deleteOne({ _id: accountRole!.id });
      PublisherServices.accountDelete(account!, user!.id);
      res
        .status(200)
        .send({ message: 'DELETE: sucess', user, account, accountRole });
    } catch (error) {
      console.log(error);
    }
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
    const { pages = 1, type, sortBy } = req.query;
    try {
      const users = await AccountService.readAllUserProfile(
        type as string,
        sortBy as string,
        pages as string
      );
      res.status(200).send({ message: 'GET: users successfully', users });
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
  static async readByType(req: Request, res: Response) {
    const { type, sortBy, pages = 1 } = req.query;

    const users = await AccountService.readByType(
      type as string,
      sortBy as string,
      parseInt(pages as string)
    );
    res.status(200).send({
      message: 'GET: users by type successfully',
      users,
    });
  }
  static async readByName(req: Request, res: Response) {
    const { pages = 1, sortBy, name } = req.query;
    const { users, totalItems } = await AccountService.readByName(
      name as string,
      parseInt(pages as string),
      sortBy as string
    );
    const convertUsers = Convert.users(users);
    res
      .status(200)
      .json({ message: 'GET: user by name successfully', users, convertUsers });
  }
}
