import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface ShiftAttrs {
  dateTime: Date;
  description: string;
}
export interface ShiftDoc extends mongoose.Document {
  dateTime: Date;
  description: string;
  isDeleted?: boolean;
  version: number;
}
interface ShiftModel extends mongoose.Model<ShiftDoc> {
  build(attrs: ShiftAttrs): ShiftDoc;
  findShift(id: string): Promise<ShiftDoc | null>;
  findShifts(ids: mongoose.Types.ObjectId[]): Promise<ShiftDoc | null>;
}

const shiftSchema = new mongoose.Schema(
  {
    dateTime: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
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
      },
    },
    timestamps: true,
  }
);
// add plugin
shiftSchema.plugin(updateIfCurrentPlugin);
// define version
shiftSchema.set('versionKey', 'version');
// define second index
shiftSchema.index({ dateTime: 1 });
// define build
shiftSchema.statics.build = (attrs: ShiftAttrs) => {
  return new Shift(attrs);
};
shiftSchema.statics.findShift = async (id: string) => {
  const shift = await Shift.findOne({ _id: id, isDeleted: false });
  return shift;
};
shiftSchema.statics.findShifts = async (ids: mongoose.Types.ObjectId[]) => {
  const shifts = await Shift.find({ _id: { $in: ids }, isDeleted: false });
  return shifts;
};

const Shift = mongoose.model<ShiftDoc, ShiftModel>('Shift', shiftSchema);
export { Shift };
