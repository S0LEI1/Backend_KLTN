import { NotFoundError } from '@share-package/common';
import { Package, PackageDoc } from '../models/package';
import { Attrs } from './order.service';

export class PackageService {
  static async getPackage(attr: Attrs) {
    const existPackage = await Package.findPackage(attr.id);
    if (!existPackage) throw new NotFoundError('Package service');
    const price = existPackage.salePrice * attr.quantity;
    return { existPackage, price };
  }
  static async getPackages(attrs: Attrs[]) {
    const packageList: PackageDoc[] = [];
    let totalPrice = 0;
    for (const attr of attrs) {
      const { existPackage, price } = await this.getPackage(attr);
      packageList.push(existPackage);
      totalPrice += price;
    }
    return { packageList, totalPrice };
  }
}
