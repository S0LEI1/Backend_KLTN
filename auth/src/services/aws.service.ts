import fs from 'fs';
import AWS from 'aws-sdk';
import { PutObjectRequest, DeleteObjectRequest } from 'aws-sdk/clients/s3';
import { BadRequestError } from '@share-package/common';
const BucketName = process.env.BUCKET_NAME;
const region = process.env.REGION;
const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
AWS.config.update({
  secretAccessKey: secretAccessKey!,
  accessKeyId: accessKeyId!,
  region: region!,
});
export const s3 = new AWS.S3();
export class AwsServices {
  static async uploadFile(file: Express.Multer.File, bucketName = BucketName) {
    const fileStream = fs.readFileSync(file.path);

    const uploadParams: PutObjectRequest = {
      Bucket: bucketName!,
      Body: fileStream,
      Key: `spa-${Date.now()}-${file.originalname}`,
    };

    const { mimetype } = file;
    if (mimetype === 'image/jpeg' || mimetype === 'image/png')
      uploadParams!.ContentType = mimetype;

    try {
      const { Location } = await s3.upload(uploadParams).promise();

      return Location;
    } catch (err) {
      console.log('err: ', err);
      throw new BadRequestError('Upload file Aws S3 failed');
    }
  }
  static async deleteFile(url: string, bucketName = BucketName) {
    const urlSplit = url.split('/');
    const key = urlSplit[urlSplit.length - 1];

    const params: DeleteObjectRequest = {
      Bucket: bucketName!,
      Key: key,
    };

    try {
      await s3.deleteObject(params).promise();
    } catch (err) {
      throw new BadRequestError('Delete file Aws S3 failed');
    }
  }
}
