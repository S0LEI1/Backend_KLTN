import {
  PackageCreatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';

export class PackageCreatedPublisher extends Publisher<PackageCreatedEvent> {
  subject: Subjects.PackageCreated = Subjects.PackageCreated;
}
