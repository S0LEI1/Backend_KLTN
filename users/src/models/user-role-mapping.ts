import { BadRequestError, NotFoundError } from '@share-package/common';
import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { UserDoc } from './user';
interface UserRoleAttrs {
  id: string;
  user: UserDoc;
  role: string;
}
interface PopulateDoc {
  id: string;
  user: string;
  roleId: string;
  userRole: string;
}
interface UserRoleDoc extends mongoose.Document {
  id: string;
  user: UserDoc;
  role: string;
  version: number;
}

interface UserRoleModel extends mongoose.Model<UserRoleDoc> {
  build(attrs: UserRoleAttrs): UserRoleDoc;
  checkRoleByUserId(id: string): Promise<PopulateDoc | null>;
}

const userRoleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
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
  }
);

userRoleSchema.set('versionKey', 'version');
userRoleSchema.plugin(updateIfCurrentPlugin);

userRoleSchema.statics.build = (attrs: UserRoleAttrs) => {
  return new UserRole(attrs);
};
const UserRole = mongoose.model<UserRoleDoc, UserRoleModel>(
  'UserRole',
  userRoleSchema
);

export { UserRole };
