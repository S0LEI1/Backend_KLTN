import { BranchCreatedPublisher } from '../events/branch-created-publisher-event';
import { BranchDeletedPublisher } from '../events/branch-deleted-publisher-event';
import { BranchUpdatedPublisher } from '../events/branch-updated-publisher-event';
import { BranchDoc } from '../models/branch';
import { natsWrapper } from '../nats-wrapper';

export class BranchPublisher {
  static async newBranch(branchDoc: BranchDoc) {
    new BranchCreatedPublisher(natsWrapper.client).publish({
      id: branchDoc.id,
      name: branchDoc.name,
      phoneNumber: branchDoc.phoneNumber,
      email: branchDoc.email,
      address: branchDoc.address,
    });
  }
  static async updateBranch(branchDoc: BranchDoc) {
    new BranchUpdatedPublisher(natsWrapper.client).publish({
      id: branchDoc.id,
      name: branchDoc.name,
      phoneNumber: branchDoc.phoneNumber,
      email: branchDoc.email,
      address: branchDoc.address,
      version: branchDoc.version,
    });
  }
  static async deleteBranch(branchDoc: BranchDoc) {
    new BranchDeletedPublisher(natsWrapper.client).publish({
      id: branchDoc.id,
      isDeleted: branchDoc.isDeleted,
      version: branchDoc.version,
    });
  }
}
