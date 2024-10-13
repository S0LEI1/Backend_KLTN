import {
  BadRequestError,
  NotFoundError,
  Pagination,
} from '@share-package/common';
import { Package } from '../models/package';
import { Check } from '../utils/check-type';
import { AwsServices } from './aws.service';
import { PackagePublisher } from './package.publisher.service';
import { PackageService } from '../models/package-service';
import { Service } from '../models/service';
import { select } from '../utils/convert';
import mongoose, { ObjectId } from 'mongoose';
const PER_PAGE = process.env.PER_PAGE!;
export class PackageServices {
  static async newPackage(
    name: string,
    costPrice: number,
    files: Express.Multer.File[],
    description: string
  ) {
    // check package exitst
    const existPackage = await Package.findOne({
      name: name,
      isDeleted: false,
    });
    // if exist => throw error
    if (existPackage) throw new BadRequestError('Package name is exist');
    // define imageUrls
    const imageUrls: string[] = [];
    for (const file of files) {
      // check file type
      Check.checkImage(file);
      // upload file
      const imageUrl = await AwsServices.uploadFile(file);
      // push imageUrl on imageUrls
      imageUrls.push(imageUrl);
    }
    // define package
    const newPackage = Package.build({
      name: name,
      description: description,
      costPrice: costPrice,
      imageUrls: imageUrls,
    });
    // save package on database
    await newPackage.save();
    // publish created event
    PackagePublisher.newPackage(newPackage);
    // return package for controller
    return newPackage;
  }
  static async readAll(
    pages: string,
    sortBy: string,
    lteDiscount: number,
    gteDiscount: number,
    ltePrice: number,
    gtePrice: number,
    isManager: boolean
  ) {
    // define query
    const query = Pagination.query();
    query.isDeleted = false;
    // if gteDiscount => find package had discount >= gteDiscount
    if (gteDiscount) query.discount = { $gte: gteDiscount };
    if (lteDiscount) query.discount = { $lte: lteDiscount };
    if (gteDiscount && lteDiscount)
      query.discount = { $gte: gteDiscount, $lte: lteDiscount };
    if (gtePrice) query.salePrice = { $gte: gtePrice };
    if (ltePrice) query.salePrice = { $lte: ltePrice };
    if (gtePrice && ltePrice)
      query.salePrice = { $gte: gtePrice, $lte: ltePrice };
    // console.log(query);
    // console.log('isManager', isManager);

    // const sort = Pagination.query();
    // get total package by query
    const options = Pagination.options(pages, PER_PAGE, sortBy);
    const totalItems = await Package.find(query).countDocuments();
    // get packages
    const packages = await Package.find(
      query,
      isManager ? null : { costPrice: 0 },
      { options, sort: { featured: -1 } }
    );
    return { packages, totalItems };
  }
  static async readOne(id: string, isManager: boolean) {
    // find package exist
    const existPackage = await Package.findOne(
      { _id: id, isDeleted: false },
      isManager ? null : select
    );
    // if exist => throw error
    if (!existPackage) throw new NotFoundError('Package');
    // check package service exist
    const packageServices = await PackageService.find(
      { package: existPackage.id },
      isManager ? null : select
    );
    // if packageService lenght => no service attach package => return package
    if (packageServices.length === 0) return existPackage;
    // define service id array
    const serviceIds: mongoose.Types.ObjectId[] = [];
    packageServices.forEach((ps) =>
      // push service id
      serviceIds.push(new mongoose.Types.ObjectId(ps.service.id))
    );
    // find services attach with package
    const services = await Service.find({ _id: { $in: serviceIds } });
    // if user = manager => return services not attach with package
    if (isManager === true) {
      const notInSerivce = await Service.find(
        { _id: { $nin: serviceIds }, isDeleted: false },
        isManager ? null : select
      );
      return { existPackage, notInSerivce, services };
    }
    return { existPackage, services };
  }
  static async deletedPackage(id: string) {
    // check exist package and isDeleted = false
    const existPackage = await Package.findPackage(id);
    // if !package => throw error
    if (!existPackage) throw new NotFoundError('Package');
    // update isDeleted = true
    existPackage.set({ isDeleted: true });
    // save database
    await existPackage.save();
    // publisher deleted event
    PackagePublisher.deletePackage(existPackage);
    // return controller
    return existPackage;
  }
}
