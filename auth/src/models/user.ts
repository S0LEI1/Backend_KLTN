import mongoose from 'mongoose';
import { Password } from '../services/password';
interface AttrsUser {
  email: string;
  password: string;
  fullName: string;
  gender: boolean;
}
// property model build has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: AttrsUser): UserDoc;
}
// property user doc has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  fullName: string;
  gender: boolean;
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
  },
  {
    toJSON: {
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
    },
  }
);
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

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
