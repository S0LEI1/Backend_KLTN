import { Request, Response } from 'express';
import { User } from '../models/user';

export class ProfileController {
  static async information(req: Request, res: Response) {
    const { id } = req.currentUser!;
    const user = await User.findUserByAccountId(id);
    res.status(200).send(user!);
  }
  static async updateInformation(req: Request, res: Response) {
    const { fullName, gender, phoneNumber, address } = req.body;
    const { id } = req.currentUser!;
    const user = await User.findUserByAccountId(id);
    console.log(user);
    user!.set({
      fullName: fullName,
      phoneNumber: phoneNumber,
      gender: gender,
      address: address,
    });
    await user!.save();
    res.status(204).send({ update: 'success', user });
  }
}
