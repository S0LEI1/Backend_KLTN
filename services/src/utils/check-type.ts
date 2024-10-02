import {
  BadRequestError,
  ListPermission,
  UserType,
} from '@share-package/common';

export class Check {
  static isManager(
    type: string,
    permissions: string[],
    requirePermission: ListPermission[]
  ) {
    const isPermission = requirePermission.every((per) =>
      permissions.includes(per)
    );
    if (type === UserType.Manager) if (isPermission) return true;
    return false;
  }
  static checkImage = (file: Express.Multer.File) => {
    const { mimetype } = file;
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      throw new BadRequestError('Image invalid');
    }
  };
}
