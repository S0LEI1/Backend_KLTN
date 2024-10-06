import { NotFoundError } from '@share-package/common';
import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
interface PermissionAttrs {
  name: string;
  active: boolean;
  systemName: string;
  description: string;
}

export interface PermissionDoc extends mongoose.Document {
  name: string;
  systemName: string;
  active: boolean;
  description: string;
  version: number;
}

interface PermissionModel extends mongoose.Model<PermissionDoc> {
  build(attrs: PermissionAttrs): PermissionDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<PermissionDoc | null>;
}

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    systemName: {
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
        (ret.id = ret._id), delete ret._id;
      },
    },
    timestamps: true,
  }
);

permissionSchema.set('versionKey', 'version');
permissionSchema.plugin(updateIfCurrentPlugin);
permissionSchema.statics.build = (attrs: PermissionAttrs) => {
  return new Permission(attrs);
};
permissionSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}) => {
  const permission = await Permission.findOne({
    _id: event.id,
    version: event.version - 1,
  });
  return permission;
};
const Permission = mongoose.model<PermissionDoc, PermissionModel>(
  'Permission',
  permissionSchema
);
export { Permission };
