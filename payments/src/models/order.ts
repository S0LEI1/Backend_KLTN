import { OrderStatus } from '@share-package/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { UserDoc } from './user';

interface OrderAttrs {
  id: string;
  customer: string;
  creator: string;
  postTaxTotal: number;
  // postTaxTotal: number;
  status: OrderStatus;
  createdAt: Date;
}

export interface OrderDoc extends mongoose.Document {
  customer: string;
  creator: string;
  execEmp?: string;
  tax: number;
  postTaxTotal: number;
  status: OrderStatus;
  isDeleted: boolean;
  createdAt: Date;
  version: number;
}
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
  findOrderByEvent(event: {
    id: string;
    version: number;
  }): Promise<OrderDoc | null>;
}

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
      required: true,
    },
    creator: {
      type: String,
      required: true,
    },
    tax: {
      type: Number,
      default: 8,
    },
    postTaxTotal: {
      type: Number,
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
    postTaxTotal: attrs.postTaxTotal,
    status: attrs.status,
    createdAt: attrs.createdAt,
  });
};
orderSchema.statics.findOrderByEvent = async (event: {
  id: string;
  version: number;
}): Promise<OrderDoc | null> => {
  const order = await Order.findOne({
    _id: event.id,
    version: event.version - 1,
    isDeleted: false,
  });
  return order;
};
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);
export { Order };
