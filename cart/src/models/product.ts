import mongoose from 'mongoose';
import { CategoryDoc } from './category';
import { SuplierDoc } from './suplier';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { BadRequestError, NotFoundError } from '@share-package/common';

export interface ProductAttrs {
  id: string;
  name: string;
  category: CategoryDoc;
  suplier: SuplierDoc;
  salePrice: number;
  imageUrl: string;
  quantity: number;
  expire: Date;
  discount: number;
  featured: boolean;
  description: string;
  code: string;
}
export interface ProductDoc extends mongoose.Document {
  name: string;
  description: string;
  category: CategoryDoc;
  suplier: SuplierDoc;
  imageUrl: string;
  expire: Date;
  salePrice: number;
  quantity: number;
  featured: boolean;
  discount: number;
  code: string;
  version: number;
  isDeleted: boolean;
  createdAt: Date;
}
interface ProductModel extends mongoose.Model<ProductDoc> {
  build(attrs: ProductAttrs): ProductDoc;
  findByName(name: string): Promise<ProductDoc | null>;
  findProduct(id: string): Promise<ProductDoc | null>;
  findByEvent(event: { id: string; event: number }): Promise<ProductDoc | null>;
}
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    suplier: {
      type: mongoose.Types.ObjectId,
      ref: 'Suplier',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    expire: {
      type: Date,
      required: true,
    },
    salePrice: {
      type: Number,
    },
    quantity: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
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

productSchema.set('versionKey', 'version');
productSchema.index({ name: 1 });
productSchema.plugin(updateIfCurrentPlugin);

productSchema.statics.build = (attrs: ProductAttrs) => {
  return new Product({
    _id: attrs.id,
    name: attrs.name,
    description: attrs.description,
    category: attrs.category,
    suplier: attrs.suplier,
    imageUrl: attrs.imageUrl,
    quantity: attrs.quantity,
    salePrice: attrs.salePrice,
    expire: attrs.expire,
    code: attrs.code,
    discount: attrs.discount,
    featured: attrs.featured,
  });
};

productSchema.statics.findByName = async (name: string) => {
  const product = await Product.findOne({ name: name });
  if (product) throw new BadRequestError('Product existing');
  return product;
};
productSchema.statics.findProduct = async (id: string) => {
  return await Product.findById({ _id: id, isDeleted: false })
    .populate('category')
    .populate('suplier')
    .exec();
};
productSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}): Promise<ProductDoc | null> => {
  const product = await Product.findOne({
    _id: event.id,
    version: event.version - 1,
    isDeleted: false,
  });
  return product;
};
const Product = mongoose.model<ProductDoc, ProductModel>(
  'Product',
  productSchema
);

export { Product };
