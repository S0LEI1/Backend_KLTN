import { NotFoundError, UserType } from '@share-package/common';
import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Password } from '../services/password';

interface AccountAttrs {
  id: string;
  email: string;
  password: string;
  type: UserType;
}
export interface AccountDoc extends mongoose.Document {
  email: string;
  password: string;
  type: UserType;
  version: number;
}

interface AccountModel extends mongoose.Model<AccountDoc> {
  build(attrs: AccountAttrs): AccountDoc;
  findAccount(id: string): Promise<AccountDoc | null>;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<AccountDoc | null>;
}

const accountSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: UserType,
    default: UserType.Customer,
  },
});

accountSchema.set('versionKey', 'version');
accountSchema.plugin(updateIfCurrentPlugin);

accountSchema.statics.build = (attrs: AccountAttrs) => {
  return new Account({
    _id: attrs.id,
    email: attrs.email,
    password: attrs.password,
    type: attrs.type,
  });
};

accountSchema.statics.findAccount = async (id: string) => {
  const account = await Account.findById(id);
  if (!account) throw new NotFoundError('Account');
  return account;
};
accountSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}) => {
  const account = await Account.findOne({
    _id: event.id,
    version: event.version - 1,
  });
  if (!account) throw new NotFoundError('Account');
  return account;
};
const Account = mongoose.model<AccountDoc, AccountModel>(
  'Account',
  accountSchema
);
export { Account };
