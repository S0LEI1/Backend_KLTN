import { Request, Response } from 'express';
import { Account } from '../models/account';
import { BadRequestError, getOtp, templateOtp } from '@share-package/common';
import { Mail } from '../services/send-mail';
const SUBJECT = 'Đây là mã OTP của bạn';
export class MailControllers {
  static async sendOtp(req: Request, res: Response) {
    const { email } = req.body;
    const account = await Account.findOne({ email: email });
    if (!account) {
      throw new BadRequestError('Email does not exists');
    }
    const otp = getOtp(6, true, false, false, false);
    const html = templateOtp.getOtpHtml(otp, Number(process.env.OTP_TIME));
    await Mail.send(email, otp, html, `${SUBJECT} ${otp}`);
    res.status(200).send({ otp: otp });
  }
}
