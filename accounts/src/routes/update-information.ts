import { requireAuth, validationRequest } from '@share-package/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Account } from '../models/account';
import { User } from '../models/user';
const router = express.Router();
router.patch(
  '/accounts/information',
  [
    body('fullName').not().isEmpty().withMessage('Full name must be provided'),
    body('gender').not().isEmpty().withMessage('Gender must be provided'),
    body('phoneNumber')
      .isMobilePhone('vi-VN')
      .withMessage('Phone number must be 10 number'),
    body('address').not().isEmpty().withMessage('Address must be provided.'),
  ],
  validationRequest,
  requireAuth,
  async (req: Request, res: Response) => {
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
);
export { router as updateInformationRouter };
