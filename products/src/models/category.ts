import { NotFoundError } from '@share-package/common';
import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface CategoryAttrs {
  name: string;
  description: string;
  code: string;
  isDeleted?: boolean;
}
export interface CategoryDoc extends mongoose.Document {
  name: string;
  description: string;
  isDeleted?: boolean;
  code: string;
  version: number;
}

interface CategoryModel extends mongoose.Model<CategoryDoc> {
  build(attrs: CategoryAttrs): CategoryDoc;
  findCategory(id: string): Promise<CategoryDoc | null>;
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
    code: {
      type: String,
      required: true,
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
  return new Category(attrs);
};
categorySchema.statics.findCategory = async (id: string) => {
  const category = await Category.findById({ _id: id });
  if (!category) throw new NotFoundError('Category');
  return category;
};
const Category = mongoose.model<CategoryDoc, CategoryModel>(
  'Category',
  categorySchema
);

export { Category };
