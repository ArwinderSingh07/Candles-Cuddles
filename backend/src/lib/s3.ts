import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
import { randomUUID } from 'crypto';

const s3Client = new S3Client({
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const getPresignedUpload = async (contentType: string) => {
  const key = `uploads/${randomUUID()}`;
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 });
  const publicUrl = `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${key}`;

  return { uploadUrl, publicUrl, key };
};

