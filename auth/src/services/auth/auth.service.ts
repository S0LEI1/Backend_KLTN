import {
  BadRequestError,
  NotFoundError,
  Publisher,
  UserType,
  getOtp,
  templateOtp,
  templatePassword,
} from '@share-package/common';
import { User, UserAttrs, UserDoc } from '../../models/user';
import { Mail } from '../../utils/send-mail';
import { Password } from '../password';
import { UserPublisher } from '../publishers/user.publisher.service';
import { getValue, redisClient } from '../../utils/redis';
import { UserRole } from '../../models/user-role-mapping';
import { Role } from '../../models/role';
import { UserRoleService } from '../user-role.service';
import exceljs from 'exceljs';
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
    const hashPass = await Password.toHash(attrs.password);
    const user = User.build({
      fullName: attrs.fullName,
      email: attrs.email,
      password: hashPass,
      phoneNumber: attrs.phoneNumber,
      gender: attrs.gender,
      address: attrs.address,
    });
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
    const hashPass = await Password.toHash(password);
    const user = User.build({
      email: email,
      password: hashPass,
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
  static async exportData(
    workbook: exceljs.Workbook,
    worksheetName: string,
    data: UserDoc[],
    type: string
  ) {
    const sheet = workbook.addWorksheet(worksheetName);
    // let colId = 'Mã người dùng';
    let colName = 'Tên người dùng';
    // if (type === UserType.Customer) colId = 'Mã khách hàng';
    // if (type === UserType.Employee) colId = 'Mã nhân viên';
    // if (type === UserType.Manager) colId = 'Mã người quản lý';
    if (type === UserType.Customer) colName = 'Tên khách hàng';
    if (type === UserType.Employee) colName = 'Tên nhân viên';
    if (type === UserType.Manager) colName = 'Tên người quản lý';
    sheet.columns = [
      // { header: colId, key: 'id', width: 25 },
      { header: colName, key: 'name', width: 50 },
      {
        header: 'Email',
        key: 'email',
        width: 30,
      },
      {
        header: 'Ảnh đại diện',
        key: 'avatar',
        width: 35,
      },
      {
        header: 'Số điện thoại',
        key: 'phoneNumber',
        width: 20,
      },
      {
        header: 'Giới tính',
        key: 'gender',
        width: 10,
      },
      {
        header: 'Địa chỉ',
        key: 'address',
        width: 20,
      },
      { header: 'Loại', key: 'type', width: 20 },
      {
        header: 'Điểm tích lũy',
        key: 'point',
        width: 15,
      },
    ];

    data.map((value, index) => {
      let type: string;
      if (value.type === UserType.Customer) type = 'Khách hàng';
      if (value.type === UserType.Employee) type = 'Nhân viên';
      if (value.type === UserType.Manager) type = 'Người quản lý';
      const gender = value.gender === true ? 'Nam' : 'Nữ';
      sheet.addRow({
        // id: value.id,
        name: value.fullName,
        email: value.email,
        phoneNumber: value.phoneNumber,
        avatar: value.avatar,
        gender: gender,
        address: value.address,
        type: type!,
        point: value.point,
        version: value.version,
      });
      let rowIndex = 1;
      for (rowIndex; rowIndex <= sheet.rowCount; rowIndex++) {
        sheet.getRow(rowIndex).alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true,
        };
      }
    });
    return workbook;
  }
  static async exportUser() {
    const workbook = new exceljs.Workbook();
    const users = await User.find({ isDeleted: false });
    await this.exportData(workbook, 'Users', users, '');
    return workbook;
  }
  static async exportUserByType() {
    const workbook = new exceljs.Workbook();
    const groupedData = await User.aggregate([
      { $group: { _id: '$type' } },
      { $project: { _id: 0, type: '$_id' } },
    ]);
    const types = groupedData.map((item) => item.type);
    for (const type of types) {
      const users = await User.find({ type: type, isDeleted: false });
      let wsName;
      if (type === UserType.Employee) wsName = 'Nhân viên';
      if (type === UserType.Customer) wsName = 'Khách hàng';
      if (type === UserType.Manager) wsName = 'Người quản lý';
      await this.exportData(workbook, wsName!, users, type);
    }
    return workbook;
  }
  static async importUser(file: Express.Multer.File) {
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(file.path);
    const users: UserDoc[] = [];
    const existUsers: UserDoc[] = [];
    for (const worksheet of workbook.worksheets) {
      const rowNumber = worksheet.rowCount;
      for (let i = 2; i <= rowNumber; i++) {
        const row = worksheet.getRow(i);
        if (!row.hasValues) {
          continue;
        }
        const existUser = await User.findOne({
          fullName: row.getCell(1).value as string,
          isDeleted: false,
        });
        if (existUser) {
          existUsers.push(existUser);
          continue;
        }
        const gender =
          (row.getCell(5).value as string) === 'Nam' ? true : false;
        let type: UserType = UserType.Customer;
        if ((row.getCell(7).value as string) === 'Nhân viên')
          type = UserType.Employee;
        if ((row.getCell(7).value as string) === 'Khách hàng')
          type = UserType.Customer;
        if ((row.getCell(7).value as string) === 'Người quản lý')
          type = UserType.Manager;
        const generatePassword = Password.generate();
        const password = 'Spa@1' + generatePassword;
        const hashPass = await Password.toHash(password);
        const user = User.build({
          fullName: row.getCell(1).value as string,
          email: row.getCell(2).value as string,
          password: hashPass,
          avatar: row.getCell(3).value as string,
          phoneNumber: row.getCell(4).value as string,
          gender: gender,
          address: row.getCell(6).value as string,
          type: type,
          point: parseInt(row.getCell(8).value as string),
        });
        await user.save();
        UserPublisher.newUser(user);
        users.push(user);
        const html = templatePassword.getOtpHtml(password);
        await Mail.send(
          row.getCell(2).value as string,
          password,
          html,
          `Chào mừng ${row.getCell(1).value as string} đến với Kim Beauty Spa`
        );
      }
    }
    return { users, existUsers };
  }
}
