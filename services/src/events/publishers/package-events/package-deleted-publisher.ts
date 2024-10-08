import {
  PackageDeletedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class PackageDeletedPublisher extends Publisher<PackageDeletedEvent> {
  subject: Subjects.PackageDeleted = Subjects.PackageDeleted;
}
