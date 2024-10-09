import { Request, Response } from 'express';
import { BadRequestError, ListPermission } from '@share-package/common';
import { CategoriesPublisher } from '../services/categories.publisher.service';
import { CategoriesServices } from '../services/categories.service';
import { Check } from '../utils/check-type';

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
    const { pages = 1, sortBy } = req.query;

    try {
      const { categories, totalItems } = await CategoriesServices.readAll(
        pages as string,
        sortBy as string
      );
      res.status(200).send({
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
    const { pages = 1, sortBy, name } = req.query;
    let isManager = false;
    try {
      if (req.currentUser) {
        const { type, permissions } = req.currentUser!;
        isManager = Check.isManager(type, permissions, [
          ListPermission.ProductRead,
        ]);
      }
      const category = await CategoriesServices.readOne(
        id,
        pages as string,
        sortBy as string,
        isManager
      );
      return res.status(200).send({
        message: 'GET:Category successfully',
        category,
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async findByName(req: Request, res: Response) {
    const { name, pages = 1, sortBy } = req.query;
    const category = await CategoriesServices.findByName(
      name as string,
      pages as string,
      sortBy as string
    );
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
