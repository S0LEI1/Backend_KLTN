import mongoose from 'mongoose';
import { ShiftDoc } from './shift';
import { UserDoc } from './user';
import { ShiftStatus } from '@share-package/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface UserShiftAttrs {
  user: UserDoc;
  shiftDoc: ShiftDoc;
}
export interface UserShiftDoc extends mongoose.Document {
  user: UserDoc;
  shiftDoc: ShiftDoc;
  status: ShiftStatus;
}
interface UserShiftModel extends mongoose.Model<UserShiftDoc> {
  build(attrs: UserShiftAttrs): UserShiftDoc;
}

const userShiftSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    shift: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Shift',
    },
    status: {
      type: String,
      enum: ShiftStatus,
      default: ShiftStatus.Created,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret._id = ret.id;
        delete ret._id;
      },
    },
    timestamps: true,
  }
);

userShiftSchema.set('versionKey', 'version');
userShiftSchema.plugin(updateIfCurrentPlugin);
userShiftSchema.statics.build = (attrs: UserShiftAttrs) => {
  return new UserShift(attrs);
};

const UserShift = mongoose.model<UserShiftDoc, UserShiftModel>(
  'UserShift',
  userShiftSchema
);
export { UserShift };
