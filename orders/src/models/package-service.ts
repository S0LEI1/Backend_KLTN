import mongoose, { mongo } from 'mongoose';
import { PackageDoc } from './package';
import { ServiceDoc } from './service';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface PackageServiceAttrs {
  id: string;
  service: ServiceDoc;
  package: PackageDoc;
  quantity: number;
}

export interface PackageServiceDoc extends mongoose.Document {
  service: ServiceDoc;
  package: PackageDoc;
  quantity: number;
  isDeleted: boolean;
  version: number;
}
interface PackageServiceModel extends mongoose.Model<PackageServiceDoc> {
  build(attrs: PackageServiceAttrs): PackageServiceDoc;
  findPackageService(id: string): Promise<PackageServiceDoc | null>;
  findByServiceAndPackage(
    serviceId: string,
    packageId: string
  ): Promise<PackageServiceDoc | null>;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<PackageServiceDoc | null>;
}

const packageServiceSchema = new mongoose.Schema(
  {
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
    quantity: {
      type: Number,
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

packageServiceSchema.set('versionKey', 'version');
packageServiceSchema.plugin(updateIfCurrentPlugin);

packageServiceSchema.statics.build = (attrs: PackageServiceAttrs) => {
  return new PackageService({
    _id: attrs.id,
    service: attrs.service,
    package: attrs.package,
    quantity: attrs.quantity,
  });
};
packageServiceSchema.statics.findPackageService = async (id: string) => {
  const PS = await PackageService.findOne({ _id: id });
  return PS;
};
packageServiceSchema.statics.findByServiceAndPackage = async (
  serviceId: string,
  packageId: string
) => {
  const PS = await PackageService.findOne({
    service: serviceId,
    package: packageId,
  });
  return PS;
};
packageServiceSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}): Promise<PackageServiceDoc | null> => {
  const packageService = await PackageService.findOne({
    _id: event.id,
    version: event.version,
  });
  return packageService;
};
const PackageService = mongoose.model<PackageServiceDoc, PackageServiceModel>(
  'PackageSerive',
  packageServiceSchema
);
export { PackageService };
