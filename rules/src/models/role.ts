import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
interface RoleAttrs {
  name: string;
  systemName: string;
  isDeleted?: boolean;
  description: string;
}

export interface RoleDoc extends mongoose.Document {
  name: string;
  active: boolean;
  systemName: string;
  isDeleted?: boolean;
  description: string;
  version: number;
}

interface RoleModel extends mongoose.Model<RoleDoc> {
  build(attrs: RoleAttrs): RoleDoc;
  findRole(id: string): Promise<RoleDoc | null>;
}

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    systemName: {
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

roleSchema.set('versionKey', 'version');
roleSchema.plugin(updateIfCurrentPlugin);
roleSchema.statics.findRole = async (id: string) => {
  const role = await Role.findOne({ _id: id, isDeleted: false });
  return role;
};

roleSchema.statics.build = (attrs: RoleAttrs) => {
  return new Role(attrs);
};

const Role = mongoose.model<RoleDoc, RoleModel>('Role', roleSchema);
export { Role };
