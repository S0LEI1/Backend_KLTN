import { NotFoundError } from '@share-package/common';
import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { PermissionDoc } from './permission';
import { RoleDoc } from './role';
interface RolePermissionAttrs {
  permission: PermissionDoc;
  role: RoleDoc;
}
interface PopulateDoc {}
export interface RolePermissionDoc extends mongoose.Document {
  permission: PermissionDoc;
  role: RoleDoc;
  version: number;
}

interface RolePermissionModel extends mongoose.Model<RolePermissionDoc> {
  build(attrs: RolePermissionAttrs): RolePermissionDoc;
  checkPermissionByRoleId(id: string): Promise<RolePermissionDoc | null>;
}

const rolePermissionSchema = new mongoose.Schema(
  {
    permission: {
      type: mongoose.Types.ObjectId,
      ref: 'Permission',
      required: true,
    },
    role: {
      type: mongoose.Types.ObjectId,
      ref: 'Role',
      required: true,
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

rolePermissionSchema.set('versionKey', 'version');
rolePermissionSchema.plugin(updateIfCurrentPlugin);
rolePermissionSchema.statics.build = (attrs: RolePermissionAttrs) => {
  return new RolePermission(attrs);
};

rolePermissionSchema.statics.checkPermissionByRoleId = async (id: string) => {
  const rolePS = await RolePermission.find({ role: id }).populate(
    'permission',
    // return data
    'name systemName'
  );
  if (!rolePS) throw new NotFoundError('Role-Permission');
  const pers: any = [];
  rolePS.forEach((rp) => pers.push(rp.permission.name));
  return pers;
};
const RolePermission = mongoose.model<RolePermissionDoc, RolePermissionModel>(
  'RolePermission',
  rolePermissionSchema
);
export { RolePermission };
