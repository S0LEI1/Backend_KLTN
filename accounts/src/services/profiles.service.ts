import { User } from '../models/user';
import { checkImage } from '../utils/check-image';
import { AwsServices } from './aws.service';

export class ProfileServices {
  static async updateAvatar(_id: string, file: Express.Multer.File) {
    try {
      checkImage(file);
      const user = await User.findUserByAccountId(_id);
      const { avatar } = user!;
      if (avatar) await AwsServices.deleteFile(avatar);
      const avatarUrl = await AwsServices.uploadFile(
        file,
        process.env.BUCKET_NAME
      );
      user!.set({ avatar: avatarUrl });
      await user!.save();
      return avatarUrl;
    } catch (error) {
      console.log(error);
    }
  }
}
