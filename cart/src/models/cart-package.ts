import mongoose from 'mongoose';
import { CartDoc } from './cart';
import { ProductDoc } from './product';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { PackageDoc } from './package';
import { ItemType } from '@share-package/common';

interface CartPackageAttrs {
  cart: CartDoc;
  package: PackageDoc;
  quantity: number;
  totalPrice: number;
}
interface CartPackageDoc extends mongoose.Document {
  cart: CartDoc;
  package: PackageDoc;
  quantity: number;
  totalPrice: number;
  type: ItemType;
  isDeleted: boolean;
  createdAt: Date;
  version: number;
}
interface CartPackageModel extends mongoose.Model<CartPackageDoc> {
  build(attrs: CartPackageAttrs): CartPackageDoc;
}

const cartPackageSchema = new mongoose.Schema(
  {
    cart: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Cart',
    },
    package: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Package',
    },
    quantity: {
      type: Number,
      default: 1,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ItemType,
      default: ItemType.Package,
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
cartPackageSchema.set('versionKey', 'version');
cartPackageSchema.plugin(updateIfCurrentPlugin);
cartPackageSchema.statics.build = (attrs: CartPackageAttrs): CartPackageDoc => {
  return new CartPackage(attrs);
};

const CartPackage = mongoose.model<CartPackageDoc, CartPackageModel>(
  'CartPackage',
  cartPackageSchema
);
export { CartPackage };
