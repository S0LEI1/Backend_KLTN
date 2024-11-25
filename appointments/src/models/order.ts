import { OrderStatus } from '@share-package/common';
import mongoose from 'mongoose';
import { UserDoc } from './user';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderAttrs {
  id: string;
  customer: UserDoc;
  creator: UserDoc;
  status: OrderStatus;
}

export interface OrderDoc extends mongoose.Document {
  customer: UserDoc;
  creator: UserDoc;
  status: OrderStatus;
  isDeleted: boolean;
  createdAt: Date;
  version: number;
}
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
  findOrder(id: string): Promise<OrderDoc | null>;
  findOrders(): Promise<OrderDoc[] | null>;
  findByEvent(event: { id: string; version: number }): Promise<OrderDoc | null>;
}

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    creator: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      enum: OrderStatus,
      default: OrderStatus.Created,
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

orderSchema.set('versionKey', 'version'),
  orderSchema.plugin(updateIfCurrentPlugin);
orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    customer: attrs.customer,
    creator: attrs.creator,
    status: attrs.status,
  });
};
orderSchema.statics.findOrder = async (
  id: string
): Promise<OrderDoc | null> => {
  const order = await Order.findOne({ _id: id, isDeleted: false });
  return order;
};
orderSchema.statics.findOrders = async (): Promise<OrderDoc[] | null> => {
  const orders = await Order.find({ isDeleted: false });
  return orders;
};
orderSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}) => {
  const order = await Order.findOne({
    _id: event.id,
    version: event.version - 1,
    isDeleted: false,
  });
  return order;
};
// orderSchema.pre('save', async function (done) {
//   const tax = this.preTaxTotal! * (this.tax / 100);
//   const postTaxTotal = this.preTaxTotal! + tax;
//   this.set('postTaxTotal', postTaxTotal);
//   done();
// });
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);
export { Order };
