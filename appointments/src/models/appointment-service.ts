import mongoose, { mongo } from 'mongoose';
import { AppointmentDoc } from './appointment';
import { ServiceDoc } from './service';
import { UserDoc } from './user';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderDoc } from './order';

interface AppointmentServiceAttrs {
  appointment: AppointmentDoc;
  service: ServiceDoc;
  quantity: number;
  execEmp?: UserDoc[];
}
interface AppointmentServiceDoc extends mongoose.Document {
  appointment: AppointmentDoc;
  service: ServiceDoc;
  quantity: number;
  execEmp?: UserDoc[];
  isDeleted: boolean;
  version: number;
}
interface AppointServiceModel extends mongoose.Model<AppointmentServiceDoc> {
  build(attrs: AppointmentServiceAttrs): AppointmentServiceDoc;
  finByAppointment(
    appointmentDoc: AppointmentDoc
  ): Promise<AppointServiceModel | null>;
}

const appointmentServiceSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Appointment',
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
    execEmp: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
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
    timestamps: true,
  }
);
appointmentServiceSchema.set('versionKey', 'version');
appointmentServiceSchema.plugin(updateIfCurrentPlugin);
appointmentServiceSchema.index({ appointment: 1, service: 1 });

appointmentServiceSchema.statics.build = (attrs: AppointmentServiceAttrs) => {
  return new AppointmentService(attrs);
};

appointmentServiceSchema.statics.finByAppointment = async (
  appointmentDoc: AppointmentDoc
): Promise<AppointmentServiceDoc | null> => {
  const apm = await AppointmentService.findOne({
    appointment: appointmentDoc.id,
    isDeleted: false,
  });
  return apm;
};
const AppointmentService = mongoose.model<
  AppointmentServiceDoc,
  AppointServiceModel
>('AppointmentService', appointmentServiceSchema);
export { AppointmentService };
