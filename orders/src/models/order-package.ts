import mongoose, { mongo } from 'mongoose';
import { OrderDoc } from './order';
import { PackageDoc } from './package';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
export interface ServiceEmbedded {
  serviceId: mongoose.Types.ObjectId;
  status: boolean;
}
interface OrderPackageAttrs {
  order: OrderDoc;
  package: PackageDoc;
  services: ServiceEmbedded[];
  quantity: number;
  totalPrice: number;
}

export interface OrderPackageDoc extends mongoose.Document {
  order: OrderDoc;
  package: PackageDoc;
  services: ServiceEmbedded[];
  quantity: number;
  totalPrice: number;
  isDeleted: boolean;
  version: number;
}
interface OrderPackageModel extends mongoose.Model<OrderPackageDoc> {
  build(attrs: OrderPackageAttrs): OrderPackageDoc;
  findByOrderId(orderId: string): Promise<OrderPackageDoc[] | null>;
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
    services: [
      {
        serviceId: {
          type: mongoose.Types.ObjectId,
        },
        status: {
          type: Boolean,
        },
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
  return new OrderPackage(attrs);
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
const OrderPackage = mongoose.model<OrderPackageDoc, OrderPackageModel>(
  'OrderPackage',
  orderPackageSchema
);
export { OrderPackage };