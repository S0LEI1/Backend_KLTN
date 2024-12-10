import { AppointmentStatus, NotFoundError } from '@share-package/common';
import { BranchDoc } from './branch';
import { UserDoc } from './user';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderDoc } from './order';

interface AppointmentAttrs {
  creator: UserDoc;
  customer: UserDoc;
  branch: BranchDoc;
  dateTime: Date;
  status: AppointmentStatus;
  description: string;
  consultant?: UserDoc;
  totalPrice?: number;
  order?: OrderDoc;
}
export interface AppointmentDoc extends mongoose.Document {
  creator: UserDoc;
  customer: UserDoc;
  branch: BranchDoc;
  dateTime: Date;
  status: AppointmentStatus;
  description: string;
  consultant: UserDoc;
  totalPrice?: number;
  order?: OrderDoc;
  isDeleted: boolean;
  version: number;
}
interface AppointmentModel extends mongoose.Model<AppointmentDoc> {
  build(attrs: AppointmentAttrs): AppointmentDoc;
  findAppointment(id: string): Promise<AppointmentDoc | null>;
}

const appointmentSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    customer: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    branch: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Branch',
    },
    order: {
      type: mongoose.Types.ObjectId,
      ref: 'Order',
    },
    dateTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: AppointmentStatus,
      default: AppointmentStatus.Created,
    },
    description: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    consultant: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    totalPrice: {
      type: Number,
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

appointmentSchema.set('versionKey', 'version');
appointmentSchema.plugin(updateIfCurrentPlugin);
appointmentSchema.index({ customer: 1, dateTime: 1 });
appointmentSchema.statics.build = (attrs: AppointmentAttrs) => {
  return new Appointment(attrs);
};
appointmentSchema.statics.findAppointment = async (
  id: string
): Promise<AppointmentDoc | null> => {
  const apm = await Appointment.findOne({ _id: id, isDeleted: false })
    .populate('customer')
    .populate('creator')
    .populate('consultant')
    .populate('branch');
  // .populate('order');
  return apm;
};
const Appointment = mongoose.model<AppointmentDoc, AppointmentModel>(
  'Appointment',
  appointmentSchema
);
export { Appointment };
