import { Pagination } from '@share-package/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
const PER_PAGE = process.env.PER_PAGE!;
interface ShiftAttrs {
  begin: Date;
  end: Date;
  isDeleted: false;
  description: string;
}
export interface ShiftDoc extends mongoose.Document {
  begin: Date;
  end: Date;
  isDeleted: false;
  description: string;
  version: number;
}
interface ShiftModel extends mongoose.Model<ShiftDoc> {
  build(attrs: ShiftAttrs): ShiftDoc;
  findShift(id: string): Promise<ShiftDoc | null>;
  findShifts(): Promise<ShiftDoc[] | null>;
}

const shiftSchema = new mongoose.Schema(
  {
    begin: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
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
        ret._id = ret.id;
        delete ret._id;
      },
    },
    timestamps: true,
  }
);
shiftSchema.set('versionKey', 'version');
shiftSchema.plugin(updateIfCurrentPlugin);
shiftSchema.statics.build = (attrs: ShiftAttrs) => {
  return new Shift(attrs);
};
shiftSchema.statics.findShift = async (
  id: string
): Promise<ShiftDoc | null> => {
  const shift = await Shift.findOne({ _id: id, isDeleted: false });
  return shift;
};
shiftSchema.statics.findShifts = async (
  query: Record<string, any>,
  pages: string,
  sortBy: string
): Promise<ShiftDoc[] | null> => {
  const options = Pagination.options(pages, PER_PAGE, sortBy);
  const shifts = await Shift.find(query, null, options);
  return shifts;
};

const Shift = mongoose.model<ShiftDoc, ShiftModel>('Shift', shiftSchema);
export { Shift };
