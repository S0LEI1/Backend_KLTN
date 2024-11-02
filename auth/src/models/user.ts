import mongoose from 'mongoose';
import { Password } from '../services/password';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { NotFoundError, UserType } from '@share-package/common';
export interface UserAttrs {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  avatar?: string;
  gender: boolean;
  address: string;
  type?: UserType;
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
}
// property user doc has
export interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  type: UserType;
  fullName: string;
  gender: boolean;
  phoneNumber: string;
  address: string;
  avatar: string;
  point: number;
  version: number;
  isDeleted: boolean;
}
const userSchema = new mongoose.Schema(
  {
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
      default:
        'https://kimbeautyspa.s3.ap-southeast-1.amazonaws.com/avatar.png',
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
  return new User(attrs);
};
// userSchema.pre('save', async function (done) {
//   if (this.isModified('password')) {
//     const hashed = await Password.toHash(this.get('password'));
//     this.set('password', hashed);
//   }
//   done();
// });
userSchema.statics.checkExists = async (id: string) => {
  const user = await User.findById(id);
  if (!user) throw new NotFoundError('User');
  return user;
};
userSchema.statics.findUser = async (id: string) => {
  const user = await User.findOne({ _id: id, isDeleted: false });
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

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
