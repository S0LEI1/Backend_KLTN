import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { UserRoleDetail } from '@share-package/common';
interface UserRoleAttrs {
  id: string;
  name: string;
  active: boolean;
  description: string;
}

export interface UserRoleDoc extends mongoose.Document {
  name: string;
  active: boolean;
  description: string;
  version: number;
}

interface UserRoleModel extends mongoose.Model<UserRoleDoc> {
  build(attrs: UserRoleAttrs): UserRoleDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<UserRoleDoc | null>;
}

const userRoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
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
  return new UserRole({
    _id: attrs.id,
    name: attrs.name,
    description: attrs.description,
  });
};
userRoleSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}) => {
  const role = await UserRole.findOne({
    _id: event.id,
    version: event.version,
  });
  return role;
};
const UserRole = mongoose.model<UserRoleDoc, UserRoleModel>(
  'UserRole',
  userRoleSchema
);
export { UserRole };
