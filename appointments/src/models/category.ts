import { NotFoundError } from '@share-package/common';
import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface CategoryAttrs {
  id: string;
  name: string;
  description: string;
  isDeleted?: boolean;
}
export interface CategoryDoc extends mongoose.Document {
  name: string;
  description: string;
  isDeleted?: boolean;
  version: number;
}

interface CategoryModel extends mongoose.Model<CategoryDoc> {
  build(attrs: CategoryAttrs): CategoryDoc;
  findCategory(id: string): Promise<CategoryDoc | null>;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<CategoryDoc | null>;
}

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
categorySchema.index({ name: 1 });
categorySchema.set('versionKey', 'version');
categorySchema.plugin(updateIfCurrentPlugin);

categorySchema.statics.build = (attrs: CategoryAttrs) => {
  return new Category({
    _id: attrs.id,
    name: attrs.name,
    description: attrs.description,
  });
};
categorySchema.statics.findCategory = async (id: string) => {
  const category = await Category.findById({ _id: id, isDeleted: false });
  return category;
};
categorySchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}): Promise<CategoryDoc | null> => {
  const category = await Category.findOne({
    _id: event.id,
    version: event.version - 1,
    isDeleted: false,
  });
  return category;
};
const Category = mongoose.model<CategoryDoc, CategoryModel>(
  'Category',
  categorySchema
);

export { Category };
