import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { calcSalePrice } from '../utils/calcSalePrice';

export interface ServiceAttrs {
  name: string;
  costPrice: number;
  salePrice?: number;
  imageUrl: string;
  time: number;
  expire: number;
  code: string;
  description: string;
}
export interface ServiceDoc extends mongoose.Document {
  name: string;
  imageUrl: string;
  costPrice: number;
  salePrice: number;
  discount: number;
  time: number;
  expire: number;
  featured: boolean;
  description: string;
  code: string;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
}

interface ServiceModel extends mongoose.Model<ServiceDoc> {
  build(attrs: ServiceAttrs): ServiceDoc;
  findService(id: string): Promise<ServiceDoc | null>;
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
    },
    discount: {
      type: Number,
      default: 0,
    },
    time: {
      type: Number,
      required: true,
    },
    expire: {
      type: Number,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
    featured: {
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

serviceSchema.set('versionKey', 'version');
serviceSchema.index({ name: 1 });
serviceSchema.plugin(updateIfCurrentPlugin);
serviceSchema.statics.build = (attrs: ServiceAttrs) => {
  return new Service(attrs);
};
serviceSchema.statics.findService = async (id: string) => {
  const service = await Service.findOne({ _id: id, isDeleted: false });
  return service;
};
serviceSchema.pre('save', async function (done) {
  const salePrice = calcSalePrice(this.costPrice, this.discount!);
  this.set('salePrice', salePrice);
  done();
});
// serviceSchema.pre('updateOne', async function (done) {
//   const update = this.getUpdate();
//   update.
// })
const Service = mongoose.model<ServiceDoc, ServiceModel>(
  'Service',
  serviceSchema
);
export { Service };
