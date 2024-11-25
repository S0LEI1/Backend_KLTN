import mongoose, { mongo } from 'mongoose';
import { OrderDoc } from './order';
import { ServiceDoc } from './service';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
export interface UsageLog {
  date: Date;
  status: boolean;
}
interface OrderServiceAttrs {
  id: String;
  order: OrderDoc;
  service: ServiceDoc;
  quantity: number;
  totalPrice: number;
  usageLogs?: UsageLog[];
}
export interface OrderServiceDoc extends mongoose.Document {
  order: OrderDoc;
  service: ServiceDoc;
  quantity: number;
  totalPrice: number;
  usageLogs?: UsageLog[];
  isDeleted: boolean;
  version: number;
}
interface OrderServiceModel extends mongoose.Model<OrderServiceDoc> {
  build(attrs: OrderServiceAttrs): OrderServiceDoc;
  findByOrderId(orderId: string): Promise<OrderServiceDoc[] | null>;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<OrderServiceDoc | null>;
}

const orderServiceSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    service: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Service',
    },
    quantity: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    usageLogs: [
      {
        date: {
          type: Date,
        },
        status: {
          type: Boolean,
        },
      },
    ],
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

orderServiceSchema.set('versionKey', 'version');
orderServiceSchema.plugin(updateIfCurrentPlugin);

orderServiceSchema.statics.build = (
  attrs: OrderServiceAttrs
): OrderServiceDoc => {
  return new OrderServiceM({
    id: attrs.id,
    order: attrs.order,
    service: attrs.service,
    quantity: attrs.quantity,
    totalPrice: attrs.totalPrice,
  });
};
orderServiceSchema.statics.findByOrderId = async (
  orderId: string
): Promise<OrderServiceDoc[] | null> => {
  const orderServices = await OrderServiceM.find({
    order: orderId,
    isDeleted: false,
  });
  return orderServices;
};
orderServiceSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}): Promise<OrderServiceDoc | null> => {
  const op = await OrderServiceM.findOne({
    _id: event.id,
    version: event.version - 1,
    isDeleted: false,
  });
  return op;
};
const OrderServiceM = mongoose.model<OrderServiceDoc, OrderServiceModel>(
  'OrderService',
  orderServiceSchema
);
export { OrderServiceM };
