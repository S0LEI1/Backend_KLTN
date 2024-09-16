import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
interface PermissionAttrs {
  name: string;
  systemName: string;
  description: string;
}

interface PermissionDoc extends mongoose.Document {
  name: string;
  systemName: string;
  description: string;
  version: number;
}

interface PermissionModel extends mongoose.Model<PermissionDoc> {
  build(attrs: PermissionAttrs): PermissionDoc;
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
  }
);

permissionSchema.set('versionKey', 'version');
permissionSchema.plugin(updateIfCurrentPlugin);
permissionSchema.statics.build = (attrs: PermissionAttrs) => {
  return new Permission(attrs);
};

const Permission = mongoose.model<PermissionDoc, PermissionModel>(
  'Permission',
  permissionSchema
);
export { Permission };
