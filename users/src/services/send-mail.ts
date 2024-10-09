import { SendMail } from '@share-package/common';
import { setValue } from './redis';

export class Mail {
  static async send(email: string, otp: string, html: string, subject: string) {
    try {
      const info = await SendMail({
        authMail: process.env.AUTH_MAIL!,
        authPassword: process.env.AUTH_PASS!,
        toEmail: email,
        otp: otp,
        message: html,
        subject: subject,
      });
      // store otp
      // expires 5 minutes
      await setValue(email, otp, Number(process.env.OTP_TIME));
    } catch (error) {
      console.log(error);
    }
  }
}
