import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { UserRoleDetail } from '@share-package/common';
interface UserRoleAttrs {
  name: UserRoleDetail;
  description: string;
}

interface UserRoleDoc extends mongoose.Document {
  name: string;
  description: string;
  version: number;
}

interface UserRoleModel extends mongoose.Model<UserRoleDoc> {
  build(attrs: UserRoleAttrs): UserRoleDoc;
}

const userRoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
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
