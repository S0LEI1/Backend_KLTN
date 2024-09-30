import mongoose from 'mongoose';
import { CategoryDoc } from './category';
import { SuplierDoc } from './suplier';

interface ProductAttrs {
  name: string;
  description: string;
  category: CategoryDoc;
  suplier: SuplierDoc;
  imageUrl: string;
  active: boolean;
}
interface ProductDoc extends mongoose.Document {
  name: string;
  description: string;
  category: CategoryDoc;
  suplier: SuplierDoc;
  imageUrl: string;
  active: boolean;
}
interface ProductModel extends mongoose.Model<ProductDoc> {
  build(attrs: ProductAttrs): ProductDoc;
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
    active: {
      type: Boolean,
      default: true,
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

const Product = mongoose.model<ProductDoc, ProductModel>(
  'Product',
  productSchema
);

export { Product };
