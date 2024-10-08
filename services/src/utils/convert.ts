import { ServiceDoc } from '../models/service';
export const select = { costPrice: 0, version: 0, isDeleted: 0 };
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
