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
  static async getBranchs(req: Request, res: Response) {
    const { name } = req.query;
    const branchs = await BranchService.getBranchs(name as string);
    res.status(200).send({ message: 'GET: branchs successfullt', branchs });
  }
  static async getBranch(req: Request, res: Response) {
    const { id } = req.params;
    const branch = await BranchService.getBranch(id);
    res.status(200).send({ message: 'GET: branch successfully', branch });
  }
  static async updateBranch(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, phoneNumber, address } = req.body;
    const updateBranch = await BranchService.updateBranch({
      id: id,
      name: name,
      phoneNumber: phoneNumber,
      email: email,
      address: address,
    });
    res.status(200).send({
      message: 'PATCH: update branch successfully',
      branch: updateBranch,
    });
  }
  static async deleteBranch(req: Request, res: Response) {
    const { id } = req.params;
    const deleteBranch = await BranchService.deleteBranch(id);
    res
      .status(200)
      .send({
        message: 'PATCH: delete branch successfully',
        branch: deleteBranch,
      });
  }
}
