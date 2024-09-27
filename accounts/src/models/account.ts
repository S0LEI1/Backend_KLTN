import { NotFoundError, UserType } from '@share-package/common';
import { UserDoc } from './user';
import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Password } from '../services/password';

interface AccountAttrs {
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
  return new Account(attrs);
};

accountSchema.statics.findAccount = async (id: string) => {
  const account = await Account.findById(id);
  if (!account) throw new NotFoundError('Account');
  return account;
};
accountSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});
const Account = mongoose.model<AccountDoc, AccountModel>(
  'Account',
  accountSchema
);
export { Account };
