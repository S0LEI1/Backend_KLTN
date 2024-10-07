import express, { Request, Response } from 'express';
import { Role } from '../models/role';
import { RoleServices } from '../services/roles.service';
import { body } from 'express-validator';
import {
  BadRequestError,
  Check,
  ListPermission,
  NotFoundError,
} from '@share-package/common';
import { AccountRole } from '../models/account-role-mapping';
import mongoose from 'mongoose';
export class RoleControllers {
  static async newRole(req: Request, res: Response) {
    try {
      const { name, description, systemName } = req.body;
      const newRole = await RoleServices.newRole(name, description, systemName);
      res.status(201).send({ create: 'success', newRole });
    } catch (error) {
      console.log(error);
    }
  }
  static async readAll(req: Request, res: Response) {
    try {
      const { pages = 1, sortBy } = req.query;
      const roles = await RoleServices.readAll(
        pages as string,
        sortBy as string
      );
      res.status(200).send({ message: 'GET: Roles successfully', roles });
    } catch (error) {
      console.log(error);
    }
  }
  static async readOne(req: Request, res: Response) {
    try {
      const { roleId } = req.params;
      const { pages, sortBy } = req.query;
      const { id, type, permissions } = req.currentUser!;
      if (!req.currentUser) throw new BadRequestError('You need sign in');
      const isManager = Check.isManager(type, permissions, [
        ListPermission.RoleRead,
      ]);
      const accountRole = await AccountRole.findOne({ account: id });
      if (!accountRole && isManager === false)
        throw new BadRequestError('Required type manager or own role');
      const response = await RoleServices.readOne(
        roleId,
        isManager,
        pages as string,
        sortBy as string
      );
      res.status(200).send({
        message: 'GET: Role information successfully',
        role: response.role,
        permissions: response.permissions,
        notInPermission: response.notInPermission,
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async updateRole(req: Request, res: Response) {
    const existsRole = await Role.findById(req.params.id);
    if (!existsRole) {
      throw new BadRequestError('Role do not exists');
    }
    const { name, description } = req.body;
    existsRole.set({
      name,
      description,
    });
    await existsRole.save();
  }
  static async deleteRole(req: Request, res: Response) {
    const { id } = req.params;
    const role = await RoleServices.deleteRole(id);

    res.status(200).send({ message: 'PATCH: delete role successfully', role });
  }
  static async readRoleOfAccount(req: Request, res: Response) {
    const { accountId } = req.params;
    const { id, type, permissions } = req.currentUser!;
    if (!req.currentUser) throw new BadRequestError('You need sign in');
    const isManager = Check.isManager(type, permissions, [
      ListPermission.RoleRead,
    ]);
    const accountRoles = await AccountRole.find({
      account: new mongoose.Types.ObjectId(accountId),
    });
    if (accountId !== id && isManager === false)
      throw new BadRequestError('Not permission');
    // if (accountRoles.length === 0)
    //   throw new BadRequestError('Required type manager or own role');
    const roles = await RoleServices.readRoleOfAccount(accountRoles);
    if (isManager === true) {
      const notInRole = await RoleServices.readRoleNotInAccount(accountRoles);
      return res.status(200).send({
        message: 'GET: Role of account successfully',
        roles,
        notInRole,
      });
    }
    res.status(200).send({
      message: 'GET: Role of account successfully',
      roles: roles,
    });
  }
}
