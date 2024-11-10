import mongoose, { mongo } from 'mongoose';
import { OrderDoc } from './order';
import { ProductDoc } from './product';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderProductAttrs {
  order: OrderDoc;
  product: ProductDoc;
  quantity: number;
  totalPrice: number;
}
export interface OrderProductDoc extends mongoose.Document {
  order: OrderDoc;
  product: ProductDoc;
  quantity: number;
  totalPrice: number;
  isDeleted: boolean;
  version: number;
}
interface OrderProductModel extends mongoose.Model<OrderProductDoc> {
  build(attrs: OrderProductAttrs): OrderProductDoc;
  findByOrderId(orderId: string): Promise<OrderProductDoc[] | null>;
}

const orderProductSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    product: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
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
  }
);
orderProductSchema.set('versionKey', 'version'),
  orderProductSchema.plugin(updateIfCurrentPlugin);

orderProductSchema.statics.build = (attrs: OrderProductAttrs) => {
  return new OrderProduct(attrs);
};

orderProductSchema.statics.findByOrderId = async (
  orderId: string
): Promise<OrderProductDoc[] | null> => {
  const orderProducts = await OrderProduct.find({
    order: orderId,
    isDeleted: false,
  });
  return orderProducts;
};

const OrderProduct = mongoose.model<OrderProductDoc, OrderProductModel>(
  'OrderProduct',
  orderProductSchema
);
export { OrderProduct };
