import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface BranchAttrs {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
}

export interface BranchDoc extends mongoose.Document {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  isDeleted: boolean;
  version: number;
}

interface BranchModel extends mongoose.Model<BranchDoc> {
  build(attrs: BranchAttrs): BranchDoc;
  findBranch(id: string): Promise<BranchDoc | null>;
}

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
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

branchSchema.index({ name: 1 });
branchSchema.set('versionKey', 'version');
branchSchema.plugin(updateIfCurrentPlugin);
branchSchema.statics.build = (attrs: BranchAttrs) => {
  return new Branch(attrs);
};

branchSchema.statics.findBranch = async (
  id: string
): Promise<BranchDoc | null> => {
  const branch = await Branch.findOne({ _id: id, isDeleted: false });
  return branch;
};

const Branch = mongoose.model<BranchDoc, BranchModel>('branch', branchSchema);
export { Branch };
