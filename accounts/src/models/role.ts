import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { NotFoundError } from '@share-package/common';
interface RoleAttrs {
  id: string;
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
  findByEvent(event: { id: string; version: number }): Promise<RoleDoc | null>;
  findRole(id: string): Promise<RoleDoc | null>;
}

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
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
  return new Role({
    _id: attrs.id,
    name: attrs.name,
    active: attrs.active,
    description: attrs.description,
  });
};
roleSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}) => {
  const role = await Role.findOne({
    _id: event.id,
    version: event.version,
  });
  return role;
};
roleSchema.statics.findRole = async (id: string) => {
  const userRole = await Role.findById(id);
  if (!Role) throw new NotFoundError('User-Role');
  return userRole;
};
const Role = mongoose.model<RoleDoc, RoleModel>('Role', roleSchema);
export { Role };
