import { Request, Response } from 'express';
import { AccountRoleService } from '../services/account-role.service';
export class AccountRoleControllers {
  static async newACR(req: Request, res: Response) {
    const { accountId, roleIds } = req.body;
    const accountRole = await AccountRoleService.newACR(accountId, roleIds);
    res.status(201).send({
      message: 'POST: Add role for account successfully',
      accountRole,
    });
  }
  static async deleteACR(req: Request, res: Response) {
    const { accountId, roleIds } = req.body;
    await AccountRoleService.deleteACR(accountId, roleIds);
    res.status(201).send({ message: 'POST:  Remove role successfully' });
  }
}
