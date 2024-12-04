import mongoose from 'mongoose';
import { CartDoc } from './cart';
import { ProductDoc } from './product';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { ServiceDoc } from './service';
import { ItemType } from '@share-package/common';

interface CartServiceAttrs {
  cart: CartDoc;
  service: ServiceDoc;
  quantity: number;
  totalPrice: number;
}
interface CartServiceDoc extends mongoose.Document {
  cart: CartDoc;
  service: ServiceDoc;
  quantity: number;
  totalPrice: number;
  type: ItemType;
  isDeleted: boolean;
  createdAt: Date;
  version: number;
}
interface CartServiceModel extends mongoose.Model<CartServiceDoc> {
  build(attrs: CartServiceAttrs): CartServiceDoc;
}

const cartServiceSchema = new mongoose.Schema(
  {
    cart: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Cart',
    },
    service: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Service',
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
      default: ItemType.Service,
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
cartServiceSchema.set('versionKey', 'version');
cartServiceSchema.plugin(updateIfCurrentPlugin);
cartServiceSchema.statics.build = (attrs: CartServiceAttrs): CartServiceDoc => {
  return new CartService(attrs);
};

const CartService = mongoose.model<CartServiceDoc, CartServiceModel>(
  'CartService',
  cartServiceSchema
);
export { CartService };
