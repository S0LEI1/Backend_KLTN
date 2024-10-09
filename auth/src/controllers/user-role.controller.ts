import { Request, Response } from 'express';
import { UserRoleService } from '../services/user-role.service';
export class AccountRoleControllers {
  static async newACR(req: Request, res: Response) {
    const { accountId, roleIds } = req.body;
    const accountRole = await UserRoleService.newUR(accountId, roleIds);
    res.status(201).send({
      message: 'POST: Add role for account successfully',
      accountRole,
    });
  }
  static async deleteACR(req: Request, res: Response) {
    const { accountId, roleIds } = req.body;
    await UserRoleService.deleteUR(accountId, roleIds);
    res.status(201).send({ message: 'POST:  Remove role successfully' });
  }
}
