import { BadRequestError, NotFoundError } from '@share-package/common';
import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { RoleDoc } from './role';
interface AccountRoleAttrs {
  account: string;
  role: RoleDoc;
}
interface PopulateDoc {
  id: string;
  account: string;
  roleId: string;
  role: string;
}
export interface AccountRoleDoc extends mongoose.Document {
  account: string;
  role: RoleDoc;
  version: number;
}

interface AccountRoleModel extends mongoose.Model<AccountRoleDoc> {
  build(attrs: AccountRoleAttrs): AccountRoleDoc;
}

const accountRoleSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Types.ObjectId,
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
const AccountRole = mongoose.model<AccountRoleDoc, AccountRoleModel>(
  'AccountRole',
  accountRoleSchema
);

export { AccountRole };
