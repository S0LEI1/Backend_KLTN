import {
  PackageServiceDeletedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class PackageServiceDeletedPublisher extends Publisher<PackageServiceDeletedEvent> {
  subject: Subjects.PackageServiceDeleted = Subjects.PackageServiceDeleted;
}
