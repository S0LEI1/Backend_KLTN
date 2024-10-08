import {
  PackageServiceCreatedEvent,
  Publisher,
  Subjects,
} from '@share-package/common';
export class PackageServiceCreatedPublisher extends Publisher<PackageServiceCreatedEvent> {
  subject: Subjects.PackageServiceCreated = Subjects.PackageServiceCreated;
}
