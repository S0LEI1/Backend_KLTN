import { Request, Response } from 'express';
import { PaymentServices } from '../services/payments.service';
export class PaymentControllers {
  static async payment(req: Request, res: Response) {
    const { orderId } = req.params;
    const { type } = req.body;
    const id = req.currentUser!.id;
    const userType = req.currentUser!.type;

    const result = await PaymentServices.payment(id, orderId, type, userType);
    res.status(200).send({ message: 'Payment successfully', result });
  }
  static async callback(req: Request, res: Response) {
    try {
      console.log('callback::');
      console.log(req.body);
      res.status(200).send({ message: 'Done' });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
