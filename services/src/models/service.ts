import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { calcSalePrice } from '../utils/calcSalePrice';

export interface ServiceAttrs {
  name: string;
  imageUrl: string;
  costPrice: number;
  salePrice: number;
  discount?: number;
  isDeleted?: boolean;
  active?: boolean;
  description: string;
}
export interface ServiceDoc extends mongoose.Document {
  name: string;
  imageUrl: string;
  price: number;
  costPrice: number;
  salePrice: number;
  discount?: number;
  active?: boolean;
  isDeleted?: boolean;
  description: string;
  version: number;
}

interface ServiceModel extends mongoose.Model<ServiceDoc> {
  build(attrs: ServiceAttrs): ServiceDoc;
}

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    costPrice: {
      type: Number,
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
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

serviceSchema.set('versionKey', 'version');
serviceSchema.index({ name: 1 });
serviceSchema.plugin(updateIfCurrentPlugin);
serviceSchema.statics.build = (attrs: ServiceAttrs) => {
  return new Service(attrs);
};
serviceSchema.pre('save', async function (done) {
  if (this.isModified('salePrice')) {
    const salePrice = calcSalePrice(this.costPrice, this.discount!);
    this.set('salePrice', salePrice);
  }
  done();
});
const Service = mongoose.model<ServiceDoc, ServiceModel>(
  'Service',
  serviceSchema
);
export { Service };
