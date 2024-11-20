import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export interface ServiceAttrs {
  id: string;
  name: string;
  imageUrl: string;
  salePrice: number;
  description: string;
}
export interface ServiceDoc extends mongoose.Document {
  name: string;
  imageUrl: string;
  price: number;
  costPrice: number;
  salePrice: number;
  discount: number;
  active: boolean;
  featured: boolean;
  isDeleted: boolean;
  description: string;
  version: number;
}

interface ServiceModel extends mongoose.Model<ServiceDoc> {
  build(attrs: ServiceAttrs): ServiceDoc;
  findService(id: string): Promise<ServiceDoc | null>;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<ServiceDoc | null>;
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
  return new Service({
    _id: attrs.id,
    name: attrs.name,
    imageUrl: attrs.imageUrl,
    salePrice: attrs.salePrice,
    description: attrs.description,
  });
};
serviceSchema.statics.findService = async (id: string) => {
  const service = await Service.findOne({ _id: id, isDeleted: false });
  return service;
};
serviceSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}): Promise<ServiceDoc | null> => {
  const service = await Service.findOne({
    _id: event.id,
    version: event.version - 1,
    isDeleted: false,
  });
  return service;
};
const Service = mongoose.model<ServiceDoc, ServiceModel>(
  'Service',
  serviceSchema
);
export { Service };
