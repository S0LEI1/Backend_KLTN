import { Request, Response } from 'express';
import { UserShiftServices } from '../services/user-shifts.service';
export class UserShiftControllers {
  static async newUS(req: Request, res: Response) {
    const { empId, shiftId, date } = req.body;
    const us = await UserShiftServices.newUS({
      empId: empId,
      shiftId: shiftId,
      date: date,
    });
    res.status(201).send({ message: 'POST: User-shift successfully', us });
  }
  static async readAll(req: Request, res: Response) {
    const { date } = req.query;
    try {
      const us = await UserShiftServices.readAll(date as string);
      res.status(200).send({ message: 'GET: User-Shifts successfully', us });
    } catch (error) {
      console.log(error);
    }
  }
  static async readOne(req: Request, res: Response) {
    const { id } = req.params;
    res.status(200).send({ message: 'GET: User-Shift successfully' });
  }
}
