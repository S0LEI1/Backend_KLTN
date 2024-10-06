import { BadRequestError, NotFoundError } from '@share-package/common';
import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { RoleDoc } from './role';
import { AccountDoc } from './account';
interface AccountRoleAttrs {
  account: AccountDoc;
  role: RoleDoc;
}
export interface AccountRoleDoc extends mongoose.Document {
  account: AccountDoc;
  role: RoleDoc;
  version: number;
}

interface AccountRoleModel extends mongoose.Model<AccountRoleDoc> {
  build(attrs: AccountRoleAttrs): AccountRoleDoc;
  checkRoleByAccountId(id: string): Promise<AccountRoleDoc | null>;
  findACR(id: string): Promise<AccountRoleDoc | null>;
}

const accountRoleSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    role: {
      type: mongoose.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    timestamps: true,
  }
);

accountRoleSchema.set('versionKey', 'version');
accountRoleSchema.plugin(updateIfCurrentPlugin);

accountRoleSchema.statics.build = (attrs: AccountRoleAttrs) => {
  return new AccountRole(attrs);
};
accountRoleSchema.statics.checkRoleByAccountId = async (id: string) => {
  const accountRole = await AccountRole.find({ account: id })
    // .lean()
    .populate('role', 'name');
  if (!accountRole)
    throw new BadRequestError('You dont have permission or not verified otp');
  return accountRole;
};
accountRoleSchema.statics.findACR = async (id: string) => {
  const accountRole = await AccountRole.findOne({ _id: id, isDeleted: false });
  if (!accountRole) throw new NotFoundError('Account Role');
  return accountRole;
};
const AccountRole = mongoose.model<AccountRoleDoc, AccountRoleModel>(
  'AccountRole',
  accountRoleSchema
);

export { AccountRole };
