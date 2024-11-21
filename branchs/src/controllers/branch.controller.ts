import { BranchService } from '../services/branch.service';
import { Request, Response } from 'express';

export class BranchControllers {
  static async newBranch(req: Request, res: Response) {
    const { name, email, phoneNumber, address } = req.body;
    const newBranch = await BranchService.newBranch({
      name: name,
      phoneNumber: phoneNumber,
      email: email,
      address: address,
    });
    res
      .status(200)
      .send({ message: 'POST: new branch successfullt', newBranch });
  }
}
