import { NotFoundError } from '@share-package/common';
import { User, UserAttrs } from '../../models/user';
import { checkImage } from '../../utils/check-image';
import { AwsServices } from '../aws.service';
import { UserPublisher } from '../publishers/user.publisher.service';

export class ProfileServices {
  static async updateAvatar(_id: string, file: Express.Multer.File) {
    try {
      checkImage(file);
      const user = await User.findOne({ _id: _id, isDeleted: false });
      if (!user) throw new NotFoundError('User');
      const { avatar } = user!;
      if (avatar) await AwsServices.deleteFile(avatar);
      const avatarUrl = await AwsServices.uploadFile(
        file,
        process.env.BUCKET_NAME
      );
      user!.set({ avatar: avatarUrl });
      await user!.save();
      UserPublisher.updateUser(user);
      return avatarUrl;
    } catch (error) {
      console.log(error);
    }
  }
  static async readInformation(id: string) {
    const user = await User.findOne(
      { _id: id, isDeleted: false },
      { password: 0 }
    );
    if (!user) throw new NotFoundError('Account');
    return user;
    // res.status(200).send({
    //   message: 'GET: User information successfully',
    //   user: {
    //     id: user?.id,
    //     fullName: user?.fullName,
    //     phoneNumber: user?.phoneNumber,
    //     gender: user?.gender,
    //     avatar: user?.avatar,
    //     address: user?.address,
    //     email: account.email,
    //     type: account.type,
    //   },
  }
  static async updateInformation(
    id: string,
    fullName: string,
    phoneNumber: string,
    gender: boolean,
    address: string
  ) {
    const user = await User.findOne(
      { _id: id, isDeleted: false },
      { password: 0 }
    );
    if (!user) throw new NotFoundError('User');
    user!.set({
      fullName: fullName,
      phoneNumber: phoneNumber,
      gender: gender,
      address: address,
    });
    await user.save();
    UserPublisher.updateUser(user);
    return user;
  }
}
