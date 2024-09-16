import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
interface RolePermissionAttrs {
  permissionId: string;
  userRoleId: string;
}

interface RolePermissionDoc extends mongoose.Document {
  permissionId: string;
  userRoleId: string;
  version: number;
}

interface RolePermissionModel extends mongoose.Model<RolePermissionDoc> {
  build(attrs: RolePermissionAttrs): RolePermissionDoc;
}

const rolePermissionSchema = new mongoose.Schema({
  permissionId: {
    type: mongoose.Types.ObjectId,
    ref: 'Permission',
    require: true,
  },
  userRoleId: {
    type: mongoose.Types.ObjectId,
    ref: 'UserRole',
    require: true,
  },
});

rolePermissionSchema.set('versionKey', 'version');
rolePermissionSchema.plugin(updateIfCurrentPlugin);
rolePermissionSchema.statics.build = (attrs: RolePermissionAttrs) => {
  return new RolePermission(attrs);
};

const RolePermission = mongoose.model<RolePermissionDoc, RolePermissionModel>(
  'RolePermission',
  rolePermissionSchema
);
export { RolePermission };
