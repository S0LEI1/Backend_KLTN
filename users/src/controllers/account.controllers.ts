import { Request, Response } from 'express';
import { Account } from '../models/account';
import {
  BadRequestError,
  NotFoundError,
  UserType,
  getOtp,
  templateOtp,
  templatePassword,
} from '@share-package/common';
import { User } from '../models/user';
import { Mail } from '../services/send-mail';
import { getValue, redisClient } from '../services/redis';
import { AccountRole } from '../models/user-role-mapping';
import { AccountCreatedPublisher } from '../events/publishers/account-created-publisher';
import { natsWrapper } from '../nats-wrapper';
import { AccountUpdatedPublisher } from '../events/publishers/account-updated-publisher';
import { Password } from '../services/password';
import { AccountService } from '../services/account.service';
export class AccountControllers {
  static async createEmployee(req: Request, res: Response) {
    const { email, fullName, gender, phoneNumber, address } = req.body;
    try {
      const existAccount = await Account.findOne({ email: email });
      if (existAccount) throw new BadRequestError('Email is used');
      const existsUser = await User.findOne({ phoneNumber: phoneNumber });
      if (existsUser) {
        throw new BadRequestError('Phone number is used');
      }
      const password = Password.generate();
      const account = Account.build({
        email: email,
        password: password,
        type: UserType.Employee,
      });
      await account.save();
      const user = User.build({
        fullName,
        gender,
        phoneNumber,
        address,
        account: account.id,
      });
      AccountService.accountCreatedPublisher(account);
      await user.save();
      const html = templatePassword.getOtpHtml(password);
      await Mail.send(
        email,
        password,
        html,
        `Chào mừng ${fullName} đến với Kim Beauty Spa`
      );
      res.status(201).send({ password: password });
    } catch (error) {
      console.log(error);
    }
    // new User({ email, password })
  }
  static async updatePassword(req: Request, res: Response) {
    const { email, password } = req.body;
    const account = await Account.findOne({ email: email });
    if (!account) {
      throw new NotFoundError('Account');
    }
    const passwordMatch = await Password.compare(account.password, password);
    if (passwordMatch) {
      throw new BadRequestError('Password is used');
    }
    account.set({ password: password });
    await account.save();
    // publish user update event
    new AccountUpdatedPublisher(natsWrapper.client).publish({
      id: account.id,
      email: account.email,
      password: account.password,
      type:
        account.type === UserType.Customer
          ? UserType.Customer
          : account.type === UserType.Employee
          ? UserType.Employee
          : UserType.Manager,
      version: account.version,
    });
    res.status(200).send({ update: true });
  }
  static async verifyOtp(req: Request, res: Response) {
    const { email, otp } = req.body;

    const account = await Account.findOne({ email: email });
    if (!account) throw new NotFoundError('account');

    const storeOtp = await getValue(email);
    if (storeOtp === null) {
      throw new BadRequestError('Otp has expires');
    }
    if (otp !== storeOtp) {
      throw new BadRequestError('Invalid OTP');
    }
    await redisClient.del(email);
    const accountRole = await AccountRole.findOne({ account: account.id });
    if (!accountRole) {
      new AccountCreatedPublisher(natsWrapper.client).publish({
        id: account.id,
        email: account.email,
        password: account.password,
        type:
          account.type === UserType.Customer
            ? UserType.Customer
            : account.type === UserType.Employee
            ? UserType.Employee
            : UserType.Manager,
      });
      return res.status(200).json({ 'verify-account': 'success' });
    }
    res.status(200).json({ verify: true });
  }
  static async createCustomer(req: Request, res: Response) {
    const { email, password, fullName, gender, phoneNumber, address } =
      req.body;
    try {
      const existAccount = await Account.findOne({ email: email });
      if (existAccount) throw new BadRequestError('Email is used');
      const existsUser = await User.findOne({ phoneNumber: phoneNumber });
      if (existsUser) {
        throw new BadRequestError('Phone number is used');
      }
      const account = Account.build({
        email: email,
        password: password,
        type: UserType.Customer,
      });
      await account.save();
      const user = User.build({
        fullName,
        gender,
        phoneNumber,
        address,
        account: account.id,
      });
      await user.save();
      const otp = getOtp(6, true, false, false, false);
      const html = templateOtp.getOtpHtml(otp, Number(process.env.OTP_TIME));
      await Mail.send(
        email,
        otp,
        html,
        '`Chào mừng bạn đến với Kim Beauty Spa`'
      );
      res.status(201).send({ otp: otp });
    } catch (error) {
      console.log(error);
    }
  }
}
