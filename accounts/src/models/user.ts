import mongoose from 'mongoose';
import { Password } from '../services/password';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { NotFoundError, UserType } from '@share-package/common';
import { AccountDoc } from './account';
interface AttrsUser {
  fullName: string;
  gender: boolean;
  phoneNumber: string;
  address: string;
  avatar?: string;
  account?: AccountDoc;
}
// property model build has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: AttrsUser): UserDoc;
  checkExists(id: string): UserDoc;
  findUser(id: string): Promise<UserDoc | null>;
  findUserByEvent(event: {
    id: string;
    version: number;
  }): Promise<UserDoc | null>;
  findUserByAccountId(id: string): Promise<UserDoc | null>;
}
// property user doc has
export interface UserDoc extends mongoose.Document {
  fullName: string;
  gender: boolean;
  phoneNumber: string;
  address: string;
  avatar?: string;
  account?: AccountDoc;
  version: number;
}
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      require: true,
    },
    gender: {
      type: Boolean,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    account: {
      type: mongoose.Types.ObjectId,
      ref: 'Account',
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
    },
    timestamps: true,
  }
);
userSchema.set('versionKey', 'version');
userSchema.plugin(updateIfCurrentPlugin);
userSchema.statics.build = (attrs: AttrsUser) => {
  return new User({
    fullName: attrs.fullName,
    phoneNumber: attrs.phoneNumber,
    gender: attrs.gender,
    avatar: attrs.avatar,
    address: attrs.address,
    account: attrs.account,
  });
};
userSchema.statics.checkExists = async (id: string) => {
  const user = await User.findById(id);
  if (!user) throw new NotFoundError('User');
  return user;
};
userSchema.statics.findUser = async (id: string) => {
  const user = await User.findById(id);
  if (!user) throw new NotFoundError('User');
  return user;
};
userSchema.statics.findUserByEvent = async (event: {
  id: string;
  version: number;
}) => {
  const user = await User.findOne({
    _id: event.id,
    version: event.version,
  });
  if (!user) throw new NotFoundError('User');
  return user;
};
userSchema.statics.findUserByAccountId = async (id: string) => {
  const user = await User.findOne({ account: id });
  if (!user) throw new NotFoundError('User');
  return user;
};

userSchema.virtual('info', {
  ref: 'Account',
  localField: 'account',
  foreignField: '_id',
  getters: true,
});

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
