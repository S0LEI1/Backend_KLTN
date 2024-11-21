import { BadRequestError } from '@share-package/common';
import { Branch } from '../models/branch';

export class BranchService {
  static async newBranch(branch: {
    name: string;
    phoneNumber: string;
    email: string;
    address: string;
  }) {
    const existBranch = await Branch.findOne({
      $or: [
        { name: branch.name },
        { phoneNumber: branch.phoneNumber },
        { email: branch.email },
        { address: branch.address },
      ],
    });
    if (existBranch) throw new BadRequestError('Branch information is used');
    const newBranch = Branch.build({
      name: branch.name,
      phoneNumber: branch.phoneNumber,
      email: branch.email,
      address: branch.address,
    });
    await newBranch.save();
    return newBranch;
  }
}
