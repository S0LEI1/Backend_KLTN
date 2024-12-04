import mongoose from 'mongoose';
import { CartDoc } from './cart';
import { ProductDoc } from './product';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { ItemType } from '@share-package/common';

interface CartProductAttrs {
  cart: CartDoc;
  product: ProductDoc;
  quantity: number;
  totalPrice: number;
}
interface CartProductDoc extends mongoose.Document {
  cart: CartDoc;
  product: ProductDoc;
  quantity: number;
  totalPrice: number;
  type: ItemType;
  isDeleted: boolean;
  createdAt: Date;
  version: number;
}
interface CartProductModel extends mongoose.Model<CartProductDoc> {
  build(attrs: CartProductAttrs): CartProductDoc;
}

const cartProductSchema = new mongoose.Schema(
  {
    cart: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Cart',
    },
    product: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Product',
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
      default: ItemType.Product,
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
cartProductSchema.set('versionKey', 'version');
cartProductSchema.plugin(updateIfCurrentPlugin);
cartProductSchema.statics.build = (attrs: CartProductAttrs): CartProductDoc => {
  return new CartProduct(attrs);
};

const CartProduct = mongoose.model<CartProductDoc, CartProductModel>(
  'CartProduct',
  cartProductSchema
);
export { CartProduct };
