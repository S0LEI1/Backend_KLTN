import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { NotFoundError, UserType } from '@share-package/common';
export interface UserAttrs {
  id: string;
  type?: UserType;
  email: string;
  fullName: string;
  gender: boolean;
  phoneNumber: string;
  avatar?: string;
  point?: number;
}
// property model build has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
  checkExists(id: string): UserDoc;
  findUser(id: string): Promise<UserDoc | null>;
  findUserByEvent(event: {
    id: string;
    version: number;
  }): Promise<UserDoc | null>;
  findUserByAccountId(id: string): Promise<UserDoc | null>;
  findEmployee(id: string): Promise<UserDoc | null>;
  findEmployees(ids: string[]): Promise<UserDoc[] | null>;
  findCustomer(id: string): Promise<UserDoc | null>;
}
// property user doc has
export interface UserDoc extends mongoose.Document {
  type: UserType;
  fullName: string;
  gender: boolean;
  phoneNumber: string;
  email: string;
  avatar?: string;
  point: number;
  version: number;
  isDeleted: boolean;
}
const userSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: UserType,
      default: UserType.Customer,
    },
    fullName: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      required: true,
    },
    gender: {
      type: Boolean,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    point: {
      type: Number,
      default: 100,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User({
    _id: attrs.id,
    fullName: attrs.fullName,
    gender: attrs.gender,
    phoneNumber: attrs.phoneNumber,
    type: attrs.type,
    email: attrs.email,
    avatar: attrs.avatar,
  });
};

userSchema.statics.checkExists = async (id: string) => {
  const user = await User.findById(id);
  if (!user) throw new NotFoundError('User');
  return user;
};
userSchema.statics.findUser = async (id: string) => {
  const user = await User.findOne({ _id: id, isDeleted: false });
  return user;
};
userSchema.statics.findEmployee = async (
  id: string
): Promise<UserDoc | null> => {
  const user = await User.findOne({
    _id: id,
    type: UserType.Employee,
    isDeleted: false,
  });
  return user;
};
userSchema.statics.findUserByEvent = async (event: {
  id: string;
  version: number;
}) => {
  const user = await User.findOne({
    _id: event.id,
    version: event.version - 1,
  });
  if (!user) throw new NotFoundError('User');
  return user;
};
userSchema.statics.findUserByAccountId = async (id: string) => {
  const user = await User.findOne({ account: id });
  if (!user) throw new NotFoundError('User');
  return user;
};

userSchema.statics.findEmployees = async (
  ids: string[]
): Promise<UserDoc[] | null> => {
  const user = await User.find(
    {
      _id: { $in: ids },
      type: UserType.Employee,
      isDeleted: false,
    },
    { id: 1, fullName: 1, gender: 1, avatar: 1 }
  );
  return user;
};
userSchema.statics.findCustomer = async (
  id: string
): Promise<UserDoc | null> => {
  const user = await User.findOne({
    _id: id,
    type: UserType.Customer,
    isDeleted: false,
  });
  return user;
};
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);
export { User };
