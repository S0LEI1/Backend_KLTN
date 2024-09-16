import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
interface UserURMappingAttrs {
  userId: string;
  userRoleId: string;
}

interface UserURMappingDoc extends mongoose.Document {
  userId: string;
  userRoleId: string;
  version: number;
}

interface UserURMappingModel extends mongoose.Model<UserURMappingDoc> {
  build(attrs: UserURMappingAttrs): UserURMappingDoc;
}

const userURMappingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userRoleId: {
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

const UserURMapping = mongoose.model<UserURMappingDoc, UserURMappingModel>(
  'UserURM',
  userURMappingSchema
);

export { UserURMapping };
