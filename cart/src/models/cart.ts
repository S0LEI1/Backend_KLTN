import mongoose, { mongo } from 'mongoose';
import { UserDoc } from './user';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface CartAttrs {
  user: UserDoc;
}
export interface CartDoc extends mongoose.Document {
  user: UserDoc;
  version: number;
}

interface CartModel extends mongoose.Model<CartDoc> {
  build(attrs: CartAttrs): CartDoc;
}
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      required: true,
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
cartSchema.set('versionKey', 'version');
cartSchema.plugin(updateIfCurrentPlugin);
cartSchema.statics.build = (attrs: CartAttrs): CartDoc => {
  return new Cart(attrs);
};
const Cart = mongoose.model<CartDoc, CartModel>('cart', cartSchema);
export { Cart };
