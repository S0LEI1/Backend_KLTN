import {
  BadRequestError,
  NotFoundError,
  Pagination,
} from '@share-package/common';
import { Branch } from '../models/branch';
import { BranchPublisher } from './branch.publisher.service';

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
    BranchPublisher.newBranch(newBranch);
    return newBranch;
  }
  static async getBranchs(name: string) {
    const sort = Pagination.query();
    sort.name = 1;
    if (name === 'asc') sort.name = 1;
    if (name === 'desc') sort.name = -1;

    const query = Pagination.query();
    query.isDeleted = false;
    const branchs = await Branch.find(query).sort(sort);
    return branchs;
  }
  static async getBranch(id: string) {
    const branch = await Branch.findOne({ _id: id, isDeleted: false });
    if (!branch) throw new NotFoundError('Branch not found');
    return branch;
  }
  static async updateBranch(branch: {
    id: string;
    name: string;
    phoneNumber: string;
    email: string;
    address: string;
  }) {
    const updateBranch = await Branch.findOne({
      _id: branch.id,
      isDeleted: false,
    });
    if (!updateBranch) throw new NotFoundError('Update branch not found');
    updateBranch.set({
      name: branch.name,
      phoneNumber: branch.phoneNumber,
      email: branch.email,
      address: branch.address,
    });
    await updateBranch.save();
    BranchPublisher.updateBranch(updateBranch);
    return updateBranch;
  }
  static async deleteBranch(id: string) {
    const deleteBranch = await Branch.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!deleteBranch) throw new NotFoundError('Update branch not found');
    deleteBranch.set({ isDeleted: true });
    await deleteBranch.save();
    BranchPublisher.deleteBranch(deleteBranch);
    return deleteBranch;
  }
}
