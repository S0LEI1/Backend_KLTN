import { ServiceDoc } from '../models/service';

export class Convert {
  static async service(serviceDoc: ServiceDoc) {
    const convert = {
      id: serviceDoc.id,
      name: serviceDoc.name,
      imageUrl: serviceDoc.imageUrl,
    };
    return convert;
  }
}
