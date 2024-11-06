import { Request, Response } from 'express';
import { ShiftServices } from '../services/shifts.service';
export class ShiftControllers {
  static async newShift(req: Request, res: Response) {
    try {
      const { shiftOptions, description } = req.body;
      const shift = await ShiftServices.newShift({
        shiftOptions: shiftOptions,
        description: description,
      });
      res.status(201).send({ message: 'POST: Shift successfully', shift });
    } catch (error) {
      console.log(error);
    }
  }
  static async readAll(req: Request, res: Response) {
    res.status(200).send({ message: 'GET: Shift successfully' });
  }
}
