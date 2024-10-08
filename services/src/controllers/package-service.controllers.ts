import { Request, Response } from 'express';
import { PackageServiceServices } from '../services/package-serivce.service';

export class PackageServiceControllers {
  static async newPackageService(req: Request, res: Response) {
    const { serviceId, packageId } = req.body;
    const newPS = await PackageServiceServices.newPackageService(
      serviceId,
      packageId
    );
    res
      .status(201)
      .send({ message: 'POST: Package service successfully', newPS });
  }
  static async deletePackageService(req: Request, res: Response) {
    const { id } = req.params;
    await PackageServiceServices.deletePackageSevice(id);
    res.status(200).send({ message: 'DELETE: Package service successfully' });
  }
}
