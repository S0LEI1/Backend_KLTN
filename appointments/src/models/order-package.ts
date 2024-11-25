import mongoose, { mongo } from 'mongoose';
import { OrderDoc } from './order';
import { PackageDoc } from './package';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { ServiceDoc } from './service';
import { UsageLog } from './order-service';
export interface ServiceEmbedded {
  service: ServiceDoc;
  status: boolean;
  quantity: number;
  usageLogs?: UsageLog[];
}
interface OrderPackageAttrs {
  id: String;
  order: OrderDoc;
  package: PackageDoc;
  serviceEmbedded: ServiceEmbedded[];
  quantity: number;
  totalPrice: number;
}

export interface OrderPackageDoc extends mongoose.Document {
  order: OrderDoc;
  package: PackageDoc;
  serviceEmbedded: ServiceEmbedded[];
  quantity: number;
  totalPrice: number;
  isDeleted: boolean;
  version: number;
}
interface OrderPackageModel extends mongoose.Model<OrderPackageDoc> {
  build(attrs: OrderPackageAttrs): OrderPackageDoc;
  findByOrderId(orderId: string): Promise<OrderPackageDoc[] | null>;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<OrderPackageDoc | null>;
}

const orderPackageSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    package: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Package',
    },
    serviceEmbedded: [
      {
        service: {
          type: mongoose.Types.ObjectId,
          ref: 'Service',
        },
        quantity: {
          type: Number,
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
      },
    ],
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

orderPackageSchema.set('versionKey', 'version');
orderPackageSchema.plugin(updateIfCurrentPlugin);

orderPackageSchema.statics.build = (attrs: OrderPackageDoc) => {
  return new OrderPackage({
    _id: attrs.id,
    order: attrs.order,
    package: attrs.package,
    serviceEmbedded: attrs.serviceEmbedded,
    quantity: attrs.quantity,
    totalPrice: attrs.totalPrice,
  });
};
orderPackageSchema.statics.findByOrderId = async (
  orderId: string
): Promise<OrderPackageDoc[] | null> => {
  const orderPackages = await OrderPackage.find({
    order: orderId,
    isDeleted: false,
  });
  return orderPackages;
};
orderPackageSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}): Promise<OrderPackageDoc | null> => {
  const op = await OrderPackage.findOne({
    _id: event.id,
    version: event.version - 1,
    isDeleted: false,
  });
  return op;
};
const OrderPackage = mongoose.model<OrderPackageDoc, OrderPackageModel>(
  'OrderPackage',
  orderPackageSchema
);
export { OrderPackage };
