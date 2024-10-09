import { Request, Response } from 'express';
import { AuthService } from '../services/auth/auth.service';
export class AccountControllers {
  static async createEmployee(req: Request, res: Response) {
    const { email, fullName, gender, phoneNumber, address } = req.body;
    const password = await AuthService.createEmployee(
      email,
      fullName,
      gender,
      phoneNumber,
      address
    );
    res
      .status(201)
      .send({ message: 'POST: Employee successfully', password: password });
    // new User({ email, password })
  }
  static async updatePassword(req: Request, res: Response) {
    const { email, password } = req.body;
    await AuthService.updatePassword(email, password);
    res
      .status(200)
      .send({ message: 'PATCH: password successfully', update: true });
  }
  static async verifyOtp(req: Request, res: Response) {
    const { email, otp } = req.body;
    await AuthService.verifyOtp(email, otp);
    res.status(200).json({ verify: true });
  }
  static async createCustomer(req: Request, res: Response) {
    const { email, password, fullName, gender, phoneNumber, address } =
      req.body;
    const otp = await AuthService.createCustomer({
      email: email,
      password: password,
      fullName: fullName,
      gender: gender,
      phoneNumber: phoneNumber,
      address: address,
    });
    res.status(201).send({ message: 'POST: Customer successfully', otp: otp });
  }
  static async sendOtp(req: Request, res: Response) {
    const { email } = req.body;
    const otp = await AuthService.sendOtp(email);
    res.status(200).send({ message: 'Send otp successfully', otp: otp });
  }
}
