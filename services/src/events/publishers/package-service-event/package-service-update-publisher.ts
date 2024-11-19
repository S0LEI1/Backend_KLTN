import {
  PackageServiceUpdatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class PackageServiceUpdatePublisher extends Publisher<PackageServiceUpdatedEvent> {
  subject: Subjects.PackageServiceUpdated = Subjects.PackageServiceUpdated;
}
