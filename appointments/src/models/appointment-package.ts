import mongoose from 'mongoose';
import { AppointmentDoc } from './appointment';
import { PackageDoc } from './package';
import { UserDoc } from './user';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface AppointmentPackageAttrs {
  appointment: AppointmentDoc;
  package: PackageDoc;
  quantity: number;
  execEmp?: UserDoc[];
}

export interface AppointmentPackageDoc extends mongoose.Document {
  appointment: AppointmentDoc;
  package: PackageDoc;
  quantity: number;
  execEmp: UserDoc[];
  isDeleted: boolean;
  version: number;
}

interface AppointmentPackageModel
  extends mongoose.Model<AppointmentPackageDoc> {
  build(attrs: AppointmentPackageAttrs): AppointmentPackageDoc;
  findByAppointment(
    apmDoc: AppointmentDoc
  ): Promise<AppointmentPackageDoc | null>;
}

const appointmentPackageSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Appointment',
    },
    package: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Package',
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
appointmentPackageSchema.set('versionKey', 'version');
appointmentPackageSchema.plugin(updateIfCurrentPlugin);
appointmentPackageSchema.index({ appointment: 1, package: 1 });
appointmentPackageSchema.statics.build = (attrs: AppointmentPackageAttrs) => {
  return new AppointmentPackage(attrs);
};

appointmentPackageSchema.statics.findByAppointment = async (
  appointmentDoc: AppointmentDoc
): Promise<AppointmentPackageDoc | null> => {
  const apm = await AppointmentPackage.findOne({
    appointment: appointmentDoc.id,
    isDeleted: false,
  });
  return apm;
};
const AppointmentPackage = mongoose.model<
  AppointmentPackageDoc,
  AppointmentPackageModel
>('AppointPackage', appointmentPackageSchema);
export { AppointmentPackage };
