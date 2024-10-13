import { ServiceCreatedPublisher } from '../events/publishers/service-events/service-created-publisher';
import { ServiceDeletedPublisher } from '../events/publishers/service-events/service-deleted-publisher';
import { ServiceUpdatedPublisher } from '../events/publishers/service-events/service-updated-publisher';
import { ServiceDoc } from '../models/service';
import { natsWrapper } from '../nats-wrapper';

export class ServicePublishers {
  static async new(serviceDoc: ServiceDoc) {
    new ServiceCreatedPublisher(natsWrapper.client).publish({
      id: serviceDoc.id,
      name: serviceDoc.name,
      imageUrl: serviceDoc.imageUrl,
      salePrice: serviceDoc.salePrice,
      description: serviceDoc.description,
    });
  }
  static async updateService(serviceDoc: ServiceDoc) {
    new ServiceUpdatedPublisher(natsWrapper.client).publish({
      id: serviceDoc.id,
      name: serviceDoc.name,
      imageUrl: serviceDoc.imageUrl,
      salePrice: serviceDoc.salePrice,
      description: serviceDoc.description,
      featured: serviceDoc.featured,
      discount: serviceDoc.discount,
      version: serviceDoc.version,
    });
  }
  static async deleteService(serviceDoc: ServiceDoc) {
    new ServiceDeletedPublisher(natsWrapper.client).publish({
      id: serviceDoc.id,
      isDeleted: serviceDoc.isDeleted!,
      version: serviceDoc.version,
    });
  }
}
