import {
  BadRequestError,
  NotFoundError,
  Publisher,
  UserType,
  getOtp,
  templateOtp,
  templatePassword,
} from '@share-package/common';
import { User, UserAttrs } from '../../models/user';
import { Mail } from '../../utils/send-mail';
import { Password } from '../password';
import { UserPublisher } from '../publishers/user.publisher.service';
import { getValue, redisClient } from '../../utils/redis';
import { UserRole } from '../../models/user-role-mapping';
import { Role } from '../../models/role';
import { UserRoleService } from '../user-role.service';
const SUBJECT = 'Đây là mã OTP của bạn';
export class AuthService {
  static async createCustomer(attrs: UserAttrs) {
    const existUser = await User.findOne({
      email: attrs.email,
      isDeleted: false,
    });
    if (existUser) throw new BadRequestError('Email is used');
    const existsUser = await User.findOne({ phoneNumber: attrs.phoneNumber });
    if (existsUser) {
      throw new BadRequestError('Phone number is used');
    }
    const user = User.build(attrs);
    await user.save();
    const otp = getOtp(6, true, false, false, false);
    const html = templateOtp.getOtpHtml(otp, Number(process.env.OTP_TIME));
    await Mail.send(
      attrs.email,
      otp,
      html,
      '`Chào mừng bạn đến với Kim Beauty Spa`'
    );
    return otp;
  }
  static async createEmployee(
    email: string,
    fullName: string,
    gender: boolean,
    phoneNumber: string,
    address: string
  ) {
    const existUser = await User.findOne({ email: email });
    if (existUser) throw new BadRequestError('Email is used');
    const existsUser = await User.findOne({ phoneNumber: phoneNumber });
    if (existsUser) {
      throw new BadRequestError('Phone number is used');
    }
    const generatePassword = Password.generate();
    const password = 'employee@1' + generatePassword;
    const user = User.build({
      email: email,
      password: password,
      fullName: fullName,
      gender: gender,
      phoneNumber: phoneNumber,
      address: address,
      type: UserType.Employee,
    });
    await user.save();
    UserPublisher.newUser(user);
    const role = await Role.findOne({ systemName: new RegExp('shift', 'i') });
    if (!role) throw new NotFoundError('Role');
    const userRole = await UserRoleService.newUR(user.id, [role.id]);
    const html = templatePassword.getOtpHtml(password);
    await Mail.send(
      email,
      password,
      html,
      `Chào mừng ${fullName} đến với Kim Beauty Spa`
    );
    return password;
  }
  static async updatePassword(email: string, password: string) {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new NotFoundError('user');
    }
    const passwordMatch = await Password.compare(user.password, password);
    if (passwordMatch) {
      throw new BadRequestError('Password is used');
    }
    user.set({ password: password });
    await user.save();
    UserPublisher.updateUser(user);
  }
  static async verifyOtp(email: string, otp: string) {
    const user = await User.findOne({ email: email });
    if (!user) throw new NotFoundError('account');

    const storeOtp = await getValue(email);
    if (storeOtp === null) {
      throw new BadRequestError('Otp has expires');
    }
    if (otp !== storeOtp) {
      throw new BadRequestError('Invalid OTP');
    }
    await redisClient.del(email);
    const userRole = await UserRole.findOne({ user: user.id });
    if (!userRole) {
      UserPublisher.newUser(user);
    }
  }
  static async sendOtp(email: string) {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new BadRequestError('Email does not exists');
    }
    const otp = getOtp(6, true, false, false, false);
    const html = templateOtp.getOtpHtml(otp, Number(process.env.OTP_TIME));
    await Mail.send(email, otp, html, `${SUBJECT} ${otp}`);
    return otp;
  }
}
