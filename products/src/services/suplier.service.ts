import { BadRequestError, NotFoundError } from '@share-package/common';
import { Suplier } from '../models/suplier';
const PER_PAGE = 25;
export class SuplierServices {
  static async create(name: string, description: string) {
    const existSuplier = await Suplier.findOne({ name: name });
    if (existSuplier) throw new BadRequestError('Suplier name existing');
    const suplier = Suplier.build({
      name: name,
      description: description,
    });
    await suplier.save();
    return suplier;
  }
  static async readAll(pages: number) {
    const totalItems = await Suplier.find().countDocuments();
    const supliers = await Suplier.find()
      .sort({ createdAt: -1 })
      .skip((pages - 1) * PER_PAGE)
      .limit(PER_PAGE)
      .exec();
    if (!supliers) throw new NotFoundError('Categories');
    return { supliers, totalItems };
  }
  static async readOne(id: string) {
    const suplier = await Suplier.findById(id);
    if (!suplier) throw new NotFoundError('Suplier');
    return suplier;
  }
  static async findByName(name: string) {
    const suplier = await Suplier.findOne({ name: name });
    if (!suplier) throw new NotFoundError('Suplier by name');
    return suplier;
  }
  static async update(id: string, name: string, description: string) {
    const existSuplier = await Suplier.findById(id);
    if (!existSuplier) throw new NotFoundError('Suplier update');
    existSuplier.set({ name: name, description: description });
    await existSuplier.save();
    return existSuplier;
  }
  static async delete(id: string) {
    const existSuplier = await Suplier.findById(id);
    if (!existSuplier) throw new NotFoundError('Suplier delete');
    await Suplier.deleteOne({ _id: id });
    return existSuplier;
  }
}
