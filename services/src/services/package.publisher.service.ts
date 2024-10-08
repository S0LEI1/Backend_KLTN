import { PackageCreatedPublisher } from '../events/publishers/package-events/package-created-publisher';
import { PackageDeletedPublisher } from '../events/publishers/package-events/package-deleted-publisher';
import { PackageDoc } from '../models/package';
import { natsWrapper } from '../nats-wrapper';

export class PackagePublisher {
  static async newPackage(packageDoc: PackageDoc) {
    new PackageCreatedPublisher(natsWrapper.client).publish({
      id: packageDoc.id,
      name: packageDoc.name,
      salePrice: packageDoc.salePrice!,
      imageUrls: packageDoc.imageUrls,
      description: packageDoc.description,
    });
  }
  static async deletePackage(packageDoc: PackageDoc) {
    new PackageDeletedPublisher(natsWrapper.client).publish({
      id: packageDoc.id,
      isDeleted: packageDoc.isDeleted!,
      version: packageDoc.version,
    });
  }
}
