import { NotFoundError } from '@share-package/common';
import { Service, ServiceDoc } from '../models/service';
import { Attrs } from './order.service';
import { PackageService } from '../models/package-service';
import mongoose, { ObjectId } from 'mongoose';
import { ServiceEmbedded } from '../models/order-package';
import { writeFileSync } from 'fs';
import { PDFDocument, StandardFonts } from 'pdf-lib';
interface ServiceInPackage {
  service: ServiceDoc;
  quantity: number;
}
export class ServiceService {
  static async getService(attr: Attrs) {
    const service = await Service.findService(attr.id);
    if (!service) throw new NotFoundError('Service');
    const price = service.salePrice * attr.quantity;
    return { service, price };
  }
  static async getServices(attrs: Attrs[]) {
    const services: ServiceDoc[] = [];
    let totalPrice = 0;
    for (const attr of attrs) {
      const { service, price } = await this.getService(attr);
      services.push(service);
      totalPrice += price;
    }
    return { services, totalPrice };
  }
  static async getServiceInPackage(packageId: string) {
    const packageSrvs = await PackageService.find({
      package: packageId,
      isDeleted: false,
    }).populate('service');

    const servicesInPackage: ServiceInPackage[] = [];
    // packageSrvs.map((pSrv) => {
    //   services.push(pSrv.service);
    // });
    for (const ps of packageSrvs) {
      servicesInPackage.push({
        service: ps.service,
        quantity: ps.quantity,
      });
    }

    return servicesInPackage;
  }
}
