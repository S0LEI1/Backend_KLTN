import { PackageCreatedPublisher } from '../events/publishers/package-events/package-created-publisher';
import { PackageDeletedPublisher } from '../events/publishers/package-events/package-deleted-publisher';
import { PackageUpdatedPublisher } from '../events/publishers/package-events/package-updated-publisher';
import { PackageDoc } from '../models/package';
import { natsWrapper } from '../nats-wrapper';

export class PackagePublisher {
  static async newPackage(packageDoc: PackageDoc) {
    new PackageCreatedPublisher(natsWrapper.client).publish({
      id: packageDoc.id,
      name: packageDoc.name,
      salePrice: packageDoc.salePrice!,
      imageUrl: packageDoc.imageUrl,
      description: packageDoc.description,
      count: packageDoc.count,
      expire: packageDoc.expire,
      discount: packageDoc.discount,
      featured: packageDoc.featured,
      code: packageDoc.code,
    });
  }
  static async deletePackage(packageDoc: PackageDoc) {
    new PackageDeletedPublisher(natsWrapper.client).publish({
      id: packageDoc.id,
      isDeleted: packageDoc.isDeleted!,
      version: packageDoc.version,
    });
  }
  static updatedPackage(packageDoc: PackageDoc) {
    new PackageUpdatedPublisher(natsWrapper.client).publish({
      id: packageDoc.id,
      name: packageDoc.name,
      salePrice: packageDoc.salePrice!,
      imageUrl: packageDoc.imageUrl,
      description: packageDoc.description,
      count: packageDoc.count,
      expire: packageDoc.expire,
      discount: packageDoc.discount!,
      featured: packageDoc.featured!,
      code: packageDoc.code,
      version: packageDoc.version,
    });
  }
}
