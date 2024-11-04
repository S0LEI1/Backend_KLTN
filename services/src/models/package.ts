import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { calcSalePrice } from '../utils/calcSalePrice';

interface PackageAttrs {
  name: string;
  description: string;
  costPrice: number;
  imageUrl: string;
  salePrice?: number;
  count: number;
  expire: number;
  featured?: boolean;
  discount?: number;
  isDeleted?: boolean;
}
export interface PackageDoc extends mongoose.Document {
  name: string;
  description: string;
  costPrice: number;
  imageUrl: string;
  salePrice: number;
  featured?: boolean;
  discount?: number;
  count: number;
  expire: number;
  isDeleted?: boolean;
  version: number;
}
interface PackageModel extends mongoose.Model<PackageDoc> {
  build(attrs: PackageAttrs): PackageDoc;
  findPackage(id: string): Promise<PackageDoc | null>;
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
    costPrice: {
      type: Number,
      required: true,
    },
    salePrice: {
      type: Number,
    },
    imageUrl: { type: String, required: true },
    discount: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
    },
    expire: {
      type: Number,
    },
    featured: {
      type: Boolean,
      default: false,
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
  return new Package(attrs);
};

packageSchema.statics.findPackage = async (id: string) => {
  return await Package.findOne({ _id: id, isDeleted: false });
};
packageSchema.pre('save', async function (done) {
  const price = calcSalePrice(this.costPrice, this.discount!);
  this.set('salePrice', price);
  done();
});

const Package = mongoose.model<PackageDoc, PackageModel>(
  'Package',
  packageSchema
);
export { Package };
