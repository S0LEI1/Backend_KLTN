import { Request, Response } from 'express';
import { PaymentServices } from '../services/payments.service';
export class PaymentControllers {
  static async payment(req: Request, res: Response) {
    const { orderId } = req.params;
    const id = req.currentUser!.id;
    const result = await PaymentServices.payment(id, orderId);
    res.status(200).send({ message: 'Payment successfully', result });
  }
}
