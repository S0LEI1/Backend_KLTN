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
  totalPrice: number;
}
interface AppointmentServiceDoc extends mongoose.Document {
  appointment: AppointmentDoc;
  service: ServiceDoc;
  quantity: number;
  totalPrice: number;
  isDeleted: boolean;
  version: number;
}
interface AppointServiceModel extends mongoose.Model<AppointmentServiceDoc> {
  build(attrs: AppointmentServiceAttrs): AppointmentServiceDoc;
  findByAppointment(
    appointmentDoc: AppointmentDoc
  ): Promise<AppointmentServiceDoc | null>;
  findByAppointments(
    appointmentDoc: AppointmentDoc
  ): Promise<AppointmentServiceDoc[] | null>;
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
    timestamps: true,
  }
);
appointmentServiceSchema.set('versionKey', 'version');
appointmentServiceSchema.plugin(updateIfCurrentPlugin);
appointmentServiceSchema.index({ appointment: 1, service: 1 });

appointmentServiceSchema.statics.build = (attrs: AppointmentServiceAttrs) => {
  return new AppointmentService(attrs);
};

appointmentServiceSchema.statics.findByAppointment = async (
  appointmentDoc: AppointmentDoc
): Promise<AppointmentServiceDoc | null> => {
  const apm = await AppointmentService.findOne({
    appointment: appointmentDoc.id,
    isDeleted: false,
  });
  return apm;
};
appointmentServiceSchema.statics.findByAppointments = async (
  appointmentDoc: AppointmentDoc
): Promise<AppointmentServiceDoc[] | null> => {
  const apms = await AppointmentService.find({
    appointment: appointmentDoc.id,
    isDeleted: false,
  })
    .populate('service')
    .populate('appointment');
  return apms;
};
const AppointmentService = mongoose.model<
  AppointmentServiceDoc,
  AppointServiceModel
>('AppointmentService', appointmentServiceSchema);
export { AppointmentService };
