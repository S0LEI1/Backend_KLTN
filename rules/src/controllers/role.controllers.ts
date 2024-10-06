import express, { Request, Response } from 'express';
import { Role } from '../models/role';
import { RoleServices } from '../services/roles.service';
import { body } from 'express-validator';
import { BadRequestError, Check, ListPermission } from '@share-package/common';
import { AccountRole } from '../models/account-role-mapping';
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
    const { roleId } = req.body;
    const { pages, sortBy } = req.query;
    const { id, type, permissions } = req.currentUser!;
    const isManager = Check.isManager(type, permissions, [
      ListPermission.RoleRead,
    ]);
    const accountRole = await AccountRole.findOne({ account: id });
    if (!accountRole || isManager === false)
      throw new BadRequestError('Required type manager or own role');
    const { role, rolePermissions } = await RoleServices.readOne(
      id,
      isManager,
      pages as string,
      sortBy as string
    );
    res.status(200).send({
      message: 'GET: Role information successfully',
      role,
      rolePermissions,
    });
  }
}
