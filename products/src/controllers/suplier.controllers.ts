import { Request, Response } from 'express';
export class SuplierControllers {
  static async new(req: Request, res: Response) {
    const { name, description } = req.body!;
  }
}
