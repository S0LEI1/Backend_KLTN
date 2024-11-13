import express, { Request, Response } from 'express';
import { User } from '../models/user';
import {
  Check,
  ListPermission,
  NotFoundError,
  UserType,
} from '@share-package/common';
import { Convert } from '../utils/convert';
import { ManagerService } from '../services/user/manager.service';
import { UserPublisher } from '../services/publishers/user.publisher.service';
export class ManagerControllers {
  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const user = await ManagerService.deleteUser(id);
      res.status(200).send({ message: 'DELETE: sucess', user });
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
    UserPublisher.updateUser(user!);
    res
      .status(200)
      .send({ message: 'PATCH: update user profile successfully', user });
  }
  static async readAll(req: Request, res: Response) {
    const { pages = 1, type, sortBy, gender, name } = req.query;
    try {
      let isManager = false;
      if (req.currentUser) {
        const { type, permissions } = req.currentUser!;
        isManager = Check.isManager(type, permissions, [
          ListPermission.CustomerRead,
          ListPermission.EmployeeRead,
        ]);
      }
      const { users, totalItems } = await ManagerService.readAll(
        type as string,
        sortBy as string,
        pages as string,
        gender as string,
        isManager
      );
      res
        .status(200)
        .send({ message: 'GET: users successfully', users, totalItems });
    } catch (error) {
      console.log(error);
    }
  }
  static async userProfile(req: Request, res: Response) {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) throw new NotFoundError('User');
    res.status(200).send({
      message: 'GET: user profile successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        avatar: user.avatar,
        gender: user.gender,
        address: user.address,
        email: user.email,
        type: user.type,
      },
    });
  }
  static async readByType(req: Request, res: Response) {
    const { type, sortBy, pages = 1 } = req.query;

    const users = await ManagerService.readByType(
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
    const { users, totalItems } = await ManagerService.readByName(
      name as string,
      pages as string,
      sortBy as string
    );
    res
      .status(200)
      .json({ message: 'GET: user by name successfully', users, totalItems });
  }
}
