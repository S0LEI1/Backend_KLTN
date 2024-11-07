import { Pagination, ShiftOptions } from '@share-package/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
const PER_PAGE = process.env.PER_PAGE!;
export interface ShiftAttrs {
  shiftOptions: ShiftOptions;
  description: string;
}
export interface ShiftDoc extends mongoose.Document {
  shiftOptions: ShiftOptions;
  description: string;
  isDeleted: false;
  version: number;
}
interface ShiftModel extends mongoose.Model<ShiftDoc> {
  build(attrs: ShiftAttrs): ShiftDoc;
  findShift(id: string): Promise<ShiftDoc | null>;
  findShifts(): Promise<ShiftDoc[] | null>;
}

const shiftSchema = new mongoose.Schema(
  {
    shiftOptions: {
      type: String,
      enum: ShiftOptions,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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
    timestamps: true,
  }
);
shiftSchema.set('versionKey', 'version');
shiftSchema.plugin(updateIfCurrentPlugin);
shiftSchema.index({ begin: 1, end: 1 });
shiftSchema.statics.build = (attrs: ShiftAttrs) => {
  return new Shift(attrs);
};
shiftSchema.statics.findShift = async (
  id: string
): Promise<ShiftDoc | null> => {
  const shift = await Shift.findOne({ _id: id, isDeleted: false });
  return shift;
};
// shiftSchema.statics.findShifts = async (
//   query: Record<string, any>,
//   pages: string,
//   sortBy: string
// ): Promise<ShiftDoc[] | null> => {
//   const options = Pagination.options(pages, PER_PAGE, sortBy);
//   const shifts = await Shift.find(query, null, options);
//   return shifts;
// };

const Shift = mongoose.model<ShiftDoc, ShiftModel>('Shift', shiftSchema);
export { Shift };
