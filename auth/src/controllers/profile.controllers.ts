import { Request, Response } from 'express';
import { User } from '../models/user';
import { ProfileServices } from '../services/user/profiles.service';
import { NotFoundError } from '@share-package/common';

export class ProfileController {
  static async updateAvatar(req: Request, res: Response) {
    try {
      const { file } = req;
      const { id } = req.currentUser!;
      try {
        const avatar = await ProfileServices.updateAvatar(id, file!);
        res
          .status(200)
          .send({ message: 'PATCH: update avatar successfully', avatar });
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  }
  static async information(req: Request, res: Response) {
    try {
      const { id } = req.currentUser!;
      const user = await ProfileServices.readInformation(id);
      res
        .status(200)
        .send({ message: 'GET: User information successfully', user });
    } catch (error) {
      console.log(error);
    }
  }
  static async updateInformation(req: Request, res: Response) {
    const { fullName, gender, phoneNumber, address } = req.body;
    const { id } = req.currentUser!;
    const user = await ProfileServices.updateInformation(
      id,
      fullName,
      gender,
      phoneNumber,
      address
    );
    res.status(204).send({ update: 'success', user });
  }
}
