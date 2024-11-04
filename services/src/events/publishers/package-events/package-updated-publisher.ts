import {
  PackageUpdatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class PackageUpdatedPublisher extends Publisher<PackageUpdatedEvent> {
  subject: Subjects.PackageUpdated = Subjects.PackageUpdated;
}
