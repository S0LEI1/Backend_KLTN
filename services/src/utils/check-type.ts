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
    // console.log(permissions);

    // const currentPermissions = req.currentUser!.permissions;
    //

    console.log(isPermission);

    if (type === UserType.Manager && isPermission) return true;
    return false;
  }
  static checkImage = (file: Express.Multer.File) => {
    if (!file) throw new BadRequestError('File must be provided');
    const { mimetype } = file;
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      throw new BadRequestError('Image invalid');
    }
  };
  static checkExcel(file: Express.Multer.File) {
    if (!file) throw new BadRequestError('File excel must be provided');
    if (
      file.mimetype !=
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      throw new BadRequestError('File Excel invalid');
    }
  }
}
