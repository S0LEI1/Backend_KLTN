import { ServiceCreatedPublisher } from '../events/publishers/service-events/service-created-publisher';
import { ServiceDoc } from '../models/service';
import { natsWrapper } from '../nats-wrapper';

export class ServicePublishers {
  static async new(serviceDoc: ServiceDoc) {
    new ServiceCreatedPublisher(natsWrapper.client).publish({
      id: serviceDoc.id,
      name: serviceDoc.name,
      imageUrl: serviceDoc.imageUrl,
      price: serviceDoc.price,
      active: serviceDoc.active!,
      description: serviceDoc.description,
    });
  }
  static async readAll(pages: number, sortBy: string) {}
}
