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
    const shifts = await ShiftServices.readAll();
    res.status(200).send({ message: 'GET: Shifts successfully', shifts });
  }
  static async readOne(req: Request, res: Response) {
    const shift = await ShiftServices.readOne(req.params.id);
    res.status(200).send({ message: 'GET: Shift successfully', shift });
  }
  static async updateShift(req: Request, res: Response) {
    const { id } = req.params;
    const { description } = req.body;
    const shift = await ShiftServices.updateShift({
      id: id,
      description: description,
    });
    res.status(200).send({ message: 'PATCH: shift successfully', shift });
  }
}
