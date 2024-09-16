import otpGenerator from 'otp-generator';
import { templateHtml } from './template-html';
import { SendMail } from '@share-package/common';
import { setValue } from './redis';

export class Mail {
  static async send(email: string) {
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const html = templateHtml.getOtpHtml(otp, Number(process.env.OTP_TIME));
    try {
      const info = await SendMail({
        authMail: process.env.AUTH_MAIL!,
        authPassword: process.env.AUTH_PASS!,
        toEmail: email,
        otp: otp,
        message: html,
      });
      console.log(info);
      // store otp
      // expires 5 minutes
      await setValue(email, otp, Number(process.env.OTP_TIME));
      return otp;
    } catch (error) {
      console.log(error);
    }
  }
}
