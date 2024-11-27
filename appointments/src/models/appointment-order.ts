import mongoose from 'mongoose';
import { AppointmentDoc } from './appointment';
import { OrderDoc } from './order';
import { PackageDoc } from './package';
import { ServiceDoc } from './service';

interface AppointmentOrderAttrs {
  appointment: AppointmentDoc;
  order: OrderDoc;
  package: PackageDoc;
  service: ServiceDoc;
}
export interface AppointmentOrderDoc extends mongoose.Document {
  appointment: AppointmentDoc;
  order: OrderDoc;
  package: PackageDoc;
  service: ServiceDoc;
  isDeleted: boolean;
  version: number;
}
interface AppointmentOrderModel extends mongoose.Model<AppointmentOrderDoc> {
  build(attrs: AppointmentOrderAttrs): AppointmentOrderDoc;
}

const appointmentOrderSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Appointment',
    },
    order: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Order',
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
