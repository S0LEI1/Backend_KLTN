import { BadRequestError, NotFoundError } from '@share-package/common';
import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { UserDoc } from './user';
import { UserRoleDoc } from './user-role';
interface UserURMappingAttrs {
  user: UserDoc;
  userRole: UserRoleDoc;
}
interface PopulateDoc {
  id: string;
  userId: string;
  roleId: string;
  userRole: string;
}
interface UserURMappingDoc extends mongoose.Document {
  user: UserDoc;
  userRole: UserRoleDoc;
  version: number;
}

interface UserURMappingModel extends mongoose.Model<UserURMappingDoc> {
  build(attrs: UserURMappingAttrs): UserURMappingDoc;
  checkRoleByUserId(id: string): Promise<PopulateDoc | null>;
}

const userURMappingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userRole: {
      type: mongoose.Types.ObjectId,
      ref: 'UserRole',
      reqiored: true,
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

userURMappingSchema.set('versionKey', 'version');
userURMappingSchema.plugin(updateIfCurrentPlugin);

userURMappingSchema.statics.build = (attrs: UserURMappingAttrs) => {
  return new UserURMapping(attrs);
};
userURMappingSchema.statics.checkRoleByUserId = async (id: string) => {
  const userURM = await UserURMapping.findOne({ user: id })
    // .lean()
    .populate('userRole', 'name');
  if (!userURM)
    throw new BadRequestError('You dont have permission or not verified otp');
  return {
    // id: userURM.id,
    // userId: userURM.userId,
    roleId: userURM.userRole.id,
    userRole: userURM.userRole.name,
  };
};
const UserURMapping = mongoose.model<UserURMappingDoc, UserURMappingModel>(
  'UserURM',
  userURMappingSchema
);

export { UserURMapping };
