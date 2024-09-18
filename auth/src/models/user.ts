import mongoose from 'mongoose';
import { Password } from '../services/password';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { UserURMapping } from './user-ur-mapping';
import { NotFoundError } from '@share-package/common';
interface AttrsUser {
  email: string;
  password: string;
  fullName: string;
  gender: boolean;
  phoneNumber: string;
  address: string;
  avatar?: string;
}
// property model build has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: AttrsUser): UserDoc;
  checkExists(id: string): UserDoc;
}
// property user doc has
export interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  fullName: string;
  gender: boolean;
  version: number;
  avatar?: string;
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
    fullName: {
      type: String,
      require: true,
    },
    gender: {
      type: Boolean,
      require: true,
    },
    phoneNumber: {
      type: String,
      require: true,
    },
    address: {
      type: String,
      require: true,
    },
    avatar: {
      type: String,
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
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});
userSchema.statics.build = (attrs: AttrsUser) => {
  return new User(attrs);
};
userSchema.statics.checkExists = async (id: string) => {
  const user = await User.findById(id);
  if (!user) throw new NotFoundError('User');
  return user;
};
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
