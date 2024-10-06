import { Request, Response } from 'express';
export class PermissionControllers {
  static async readPermissionOfRole(req: Request, res: Response) {
    res.status(200).send({ message: 'GET: Permission of role successfully' });
  }
}
