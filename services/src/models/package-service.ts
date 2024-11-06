import mongoose, { mongo } from 'mongoose';
import { PackageDoc } from './package';
import { ServiceDoc } from './service';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface PackageServiceAttrs {
  service: ServiceDoc;
  package: PackageDoc;
}

export interface PackageServiceDoc extends mongoose.Document {
  service: ServiceDoc;
  package: PackageDoc;
  version: number;
}
interface PackageServiceModel extends mongoose.Model<PackageServiceDoc> {
  build(attrs: PackageServiceAttrs): PackageServiceDoc;
  findPackageService(id: string): Promise<PackageServiceDoc | null>;
  findByServiceAndPackage(
    serviceId: string,
    packageId: string
  ): Promise<PackageServiceDoc | null>;
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
  return new PackageService(attrs);
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
const PackageService = mongoose.model<PackageServiceDoc, PackageServiceModel>(
  'PackageService',
  packageServiceSchema
);
export { PackageService };
