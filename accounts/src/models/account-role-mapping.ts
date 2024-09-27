import { BadRequestError, NotFoundError } from '@share-package/common';
import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { RoleDoc } from './role';
import { AccountDoc } from './account';
interface AccountRoleAttrs {
  account: AccountDoc;
  role: RoleDoc;
}
interface PopulateDoc {
  id: string;
  account: string;
  roleId: string;
  userRole: string;
}
interface AccountRoleDoc extends mongoose.Document {
  account: AccountDoc;
  role: RoleDoc;
  version: number;
}

interface AccountRoleModel extends mongoose.Model<AccountRoleDoc> {
  build(attrs: AccountRoleAttrs): AccountRoleDoc;
  checkRoleByUserId(id: string): Promise<PopulateDoc | null>;
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
      reqiored: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

accountRoleSchema.set('versionKey', 'version');
accountRoleSchema.plugin(updateIfCurrentPlugin);

accountRoleSchema.statics.build = (attrs: AccountRoleAttrs) => {
  return new AccountRole(attrs);
};
accountRoleSchema.statics.checkRoleByUserId = async (id: string) => {
  const accountRole = await AccountRole.findOne({ account: id })
    // .lean()
    .populate('role', 'name');
  if (!accountRole)
    throw new BadRequestError('You dont have permission or not verified otp');
  return {
    // id: userURM.id,
    // userId: userURM.userId,
    roleId: accountRole.role.id,
    userRole: accountRole.role.name,
  };
};
const AccountRole = mongoose.model<AccountRoleDoc, AccountRoleModel>(
  'AccountRole',
  accountRoleSchema
);

export { AccountRole };
