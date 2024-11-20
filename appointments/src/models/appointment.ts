import { AppointmentStatus } from '@share-package/common';
import { BranchDoc } from './branch';
import { UserDoc } from './user';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface AppointmentAttrs {
  creator: UserDoc;
  customer: UserDoc;
  branch: BranchDoc;
  dateTime: Date;
  status: AppointmentStatus;
  description: string;
}
export interface AppointmentDoc extends mongoose.Document {
  creator: UserDoc;
  customer: UserDoc;
  branch: BranchDoc;
  dateTime: Date;
  status: AppointmentStatus;
  description: string;
  isDeleted: false;
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
    },
    customer: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    branch: {
      type: mongoose.Types.ObjectId,
      required: true,
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

appointmentSchema.statics.build = (attrs: AppointmentAttrs) => {
  return new Appointment(attrs);
};

const Appointment = mongoose.model<AppointmentDoc, AppointmentModel>(
  'appointment',
  appointmentSchema
);
export { Appointment };
