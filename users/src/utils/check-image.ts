import { BadRequestError } from '@share-package/common';

export const checkImage = (file: Express.Multer.File) => {
  const { mimetype } = file;
  if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
    throw new BadRequestError('Image invalid');
  }
};
