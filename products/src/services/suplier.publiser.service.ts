import { SuplierCreatedPublisher } from '../events/publishers/supliers/suplier-created-publisher';
import { SuplierDeletedPublisher } from '../events/publishers/supliers/suplier-deleted-publisher';
import { SuplierUpdatedPublisher } from '../events/publishers/supliers/suplier-updated-publisher';
import { SuplierDoc } from '../models/suplier';
import { natsWrapper } from '../nats-wrapper';

export class SuplierPublisher {
  static new(suplier: SuplierDoc) {
    new SuplierCreatedPublisher(natsWrapper.client).publish({
      id: suplier.id,
      name: suplier.name,
      description: suplier.description,
      phoneNumber: suplier.phoneNumber,
      email: suplier.email,
      address: suplier.address,
    });
  }
  static update(suplier: SuplierDoc) {
    new SuplierUpdatedPublisher(natsWrapper.client).publish({
      id: suplier.id,
      name: suplier.name,
      description: suplier.description,
      version: suplier.version,
      phoneNumber: suplier.phoneNumber,
      email: suplier.email,
      address: suplier.address,
    });
  }
  static delete(suplier: SuplierDoc) {
    new SuplierDeletedPublisher(natsWrapper.client).publish({
      id: suplier.id,
      version: suplier.version,
      isDeleted: suplier.isDeleted!,
    });
  }
}
