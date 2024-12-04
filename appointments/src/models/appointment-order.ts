import mongoose from 'mongoose';
import { AppointmentDoc } from './appointment';
import { OrderDoc } from './order';
import { PackageDoc } from './package';
import { ServiceDoc } from './service';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

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
    service: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Service',
    },
    package: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Package',
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
appointmentOrderSchema.set('versionKey', 'version');
appointmentOrderSchema.plugin(updateIfCurrentPlugin);

appointmentOrderSchema.statics.build = (attrs: AppointmentOrderAttrs) => {
  return;
};

const AppointmentOrder = mongoose.model<
  AppointmentOrderDoc,
  AppointmentOrderModel
>('AppointmentOrder', appointmentOrderSchema);
export { AppointmentOrder };
