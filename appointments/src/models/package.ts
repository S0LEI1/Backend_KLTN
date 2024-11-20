import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface PackageAttrs {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  salePrice: number;
}
export interface PackageDoc extends mongoose.Document {
  name: string;
  description: string;
  costPrice: number;
  imageUrl: string;
  salePrice: number;
  featured?: boolean;
  discount?: number;
  isDeleted?: boolean;
  version: number;
}
interface PackageModel extends mongoose.Model<PackageDoc> {
  build(attrs: PackageAttrs): PackageDoc;
  findPackage(id: string): Promise<PackageDoc | null>;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<PackageDoc | null>;
}

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    salePrice: {
      type: Number,
      required: true,
    },
    imageUrl: { type: String, required: true },
    discount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
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

packageSchema.set('versionKey', 'version'),
  packageSchema.plugin(updateIfCurrentPlugin);

packageSchema.statics.build = (attrs: PackageAttrs) => {
  return new Package({
    _id: attrs.id,
    name: attrs.name,
    description: attrs.description,
    imageUrl: attrs.imageUrl,
    salePrice: attrs.salePrice,
  });
};

packageSchema.statics.findPackage = async (id: string) => {
  return await Package.findOne({ _id: id, isDeleted: false });
};
packageSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}): Promise<PackageDoc | null> => {
  const existPackage = await Package.findOne({
    _id: event.id,
    version: event.version - 1,
    isDeleted: false,
  });
  return existPackage;
};
const Package = mongoose.model<PackageDoc, PackageModel>(
  'Package',
  packageSchema
);
export { Package };
