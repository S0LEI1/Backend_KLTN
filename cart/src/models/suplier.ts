import { NotFoundError } from '@share-package/common';
import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface SuplierAttrs {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  description: string;
}
export interface SuplierDoc extends mongoose.Document {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  description: string;
  version: number;
  isDeleted?: boolean;
}

interface SuplierModel extends mongoose.Model<SuplierDoc> {
  build(attrs: SuplierAttrs): SuplierDoc;
  findSuplier(id: string): Promise<SuplierDoc | null>;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<SuplierDoc | null>;
}

const suplierSchema = new mongoose.Schema(
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

suplierSchema.set('versionKey', 'version');
suplierSchema.plugin(updateIfCurrentPlugin);

suplierSchema.statics.build = (attrs: SuplierAttrs) => {
  return new Suplier({
    _id: attrs.id,
    name: attrs.name,
    email: attrs.email,
    phoneNumber: attrs.phoneNumber,
    address: attrs.address,
    description: attrs.description,
  });
};
suplierSchema.statics.findSuplier = async (id: string) => {
  const suplier = await Suplier.findById({ _id: id, isDeleted: false });
  return suplier;
};
suplierSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}): Promise<SuplierDoc | null> => {
  const suplier = await Suplier.findOne({
    _id: event.id,
    version: event.version - 1,
    isDeleted: false,
  });
  return suplier;
};
const Suplier = mongoose.model<SuplierDoc, SuplierModel>(
  'Suplier',
  suplierSchema
);
export { Suplier };
