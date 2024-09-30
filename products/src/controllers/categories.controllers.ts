import { Request, Response } from 'express';
import { CategoriesServices } from '../services/categories.service';
import { BadRequestError } from '@share-package/common';
import { CategoriesPublisher } from '../services/categories.publisher.service';

export class CategoriesControllers {
  static async new(req: Request, res: Response) {
    const { name, description } = req.body;
    try {
      const category = await CategoriesServices.create(name, description);
      CategoriesPublisher.new(category);
      res
        .status(201)
        .send({ message: 'POST: create category successfully', category });
    } catch (error) {
      if (error instanceof Error) throw new BadRequestError(error.message);
    }
  }
  static async readAll(req: Request, res: Response) {
    const { pages } = req.query || 1;

    try {
      const { categories, totalItems } = await CategoriesServices.readAll(
        parseInt(pages as string)
      );
      res
        .status(200)
        .send({
          message: 'GET: List categories successfully',
          categories,
          totalItems,
        });
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
    }
  }
  static async readOne(req: Request, res: Response) {
    const { id } = req.params;
    const category = await CategoriesServices.readOne(id);
    res.status(200).send({ message: 'GET:Category successfully', category });
  }
  static async findByName(req: Request, res: Response) {
    const { name } = req.body;
    const category = await CategoriesServices.findByName(name);
    res
      .status(200)
      .send({ message: 'GET: Category by name successfully', category });
  }
  static async update(req: Request, res: Response) {
    const { name, description } = req.body;
    const { id } = req.params;
    const existCategory = await CategoriesServices.update(
      id,
      name,
      description
    );
    CategoriesPublisher.update(existCategory);
    res.status(200).send({
      message: 'PATCH: update category successfully',
      existCategory,
    });
  }
  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    const category = await CategoriesServices.delete(id);
    CategoriesPublisher.delete(category);
    res.status(200).send({ message: 'DELETE: category successfully' });
  }
}
