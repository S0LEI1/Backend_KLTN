import mongoose from 'mongoose';
import { CategoryDoc } from './category';
import { SuplierDoc } from './suplier';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { BadRequestError, NotFoundError } from '@share-package/common';
import { calcSalePrice } from '../utils/calcSalePrice';

export interface ProductAttrs {
  name: string;
  category: CategoryDoc;
  suplier: SuplierDoc;
  costPrice: number;
  salePrice?: number;
  imageUrl: string;
  quantity: number;
  expire: Date;
  discount?: number;
  featured?: boolean;
  isDeleted?: boolean;
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
  costPrice: number;
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
    costPrice: {
      type: Number,
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
  return new Product(attrs);
};
productSchema.pre('save', async function (done) {
  const salePrice = calcSalePrice(this.costPrice, this.discount!);
  this.set('salePrice', salePrice);
  done();
});
// productSchema.pre('updateOne', async function (done) {
//   const data = this.getUpdate();
//   const salePrice = calcSalePrice(data!.costPrice, data!.discount!);
//   this.set('salePrice', salePrice);
//   done();
// });
productSchema.statics.findByName = async (name: string) => {
  const product = await Product.findOne({ name: name });
  if (product) throw new BadRequestError('Product existing');
  return product;
};
productSchema.statics.findProduct = async (id: string) => {
  return await Product.findById({ _id: id })
    .populate('category')
    .populate('suplier')
    .exec();
};
const Product = mongoose.model<ProductDoc, ProductModel>(
  'Product',
  productSchema
);

export { Product };
