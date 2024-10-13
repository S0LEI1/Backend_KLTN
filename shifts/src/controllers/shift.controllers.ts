import { Request, Response } from 'express';
import { ShiftServices } from '../services/shifts.service';
export class ShiftControllers {
  static async newShift(req: Request, res: Response) {
    const { begin, end, description } = req.body;
    console.log(begin);
    console.log(end);
    const shift = await ShiftServices.newShift(begin, end, description);
    res.status(201).send({ message: 'POST: Shift successfully', shift });
  }
  static async readAll(req: Request, res: Response) {
    res.status(200).send({ message: 'GET: Shift successfully' });
  }
}
