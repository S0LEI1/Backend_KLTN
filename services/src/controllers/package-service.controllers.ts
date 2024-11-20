import { Request, Response } from 'express';
import { PackageServiceServices } from '../services/package-serivce.service';

export class PackageServiceControllers {
  static async newPackageService(req: Request, res: Response) {
    const { serviceIds, packageId } = req.body;
    // console.log(serviceIds as string[]);

    const packageServices = await PackageServiceServices.newPackageService(
      serviceIds,
      packageId
    );
    res.status(201).send({
      message: 'POST: Package service successfully',
      packageServices,
    });
  }
  // static async deletePackageService(req: Request, res: Response) {
  //   const { serviceIds, packageId } = req.body;
  //   await PackageServiceServices.deletePackageSevice({
  //     serviceIds: serviceIds as string[],
  //     packageId: packageId,
  //   });
  //   res.status(200).send({ message: 'DELETE: Package service successfully' });
  // }
}
