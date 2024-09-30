import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface SuplierAttrs {
  name: string;
  description: string;
}
export interface SuplierDoc extends mongoose.Document {
  name: string;
  description: string;
}

interface SuplierModel extends mongoose.Model<SuplierDoc> {
  build(attrs: SuplierAttrs): SuplierDoc;
}

const suplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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

suplierSchema.set('versionKey', 'version');
suplierSchema.plugin(updateIfCurrentPlugin);

suplierSchema.statics.build = (attrs: SuplierAttrs) => {
  return new Suplier(attrs);
};

const Suplier = mongoose.model<SuplierDoc, SuplierModel>(
  'Suplier',
  suplierSchema
);
export { Suplier };
