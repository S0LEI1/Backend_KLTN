import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
interface RoleAttrs {
  name: string;
  active: boolean;
  description: string;
}

export interface RoleDoc extends mongoose.Document {
  name: string;
  active: boolean;
  description: string;
  version: number;
}

interface RoleModel extends mongoose.Model<RoleDoc> {
  build(attrs: RoleAttrs): RoleDoc;
}

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      require: true,
      default: true,
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
  }
);

roleSchema.set('versionKey', 'version');
roleSchema.plugin(updateIfCurrentPlugin);

roleSchema.statics.build = (attrs: RoleAttrs) => {
  return new Role(attrs);
};

const Role = mongoose.model<RoleDoc, RoleModel>('Role', roleSchema);
export { Role };
