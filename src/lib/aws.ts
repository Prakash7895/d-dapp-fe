import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY!,
  },
});

export const uploadFile = async (
  file: File,
  userId: number,
  section: string = 'photos'
) => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const s3Key = `${userId}/${section}/${new Date().getTime()}-${file.name}`;

  const s3Response = await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  return s3Key;
};

export const getS3FileByUserId = async (
  userId: string,
  limit: number = 10,
  continuationToken?: string
) => {
  try {
    const prefix = `${userId}/photos/`;
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET!,
      Prefix: prefix,
      MaxKeys: limit,
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);

    const files = await Promise.all(
      (response.Contents || []).map(async (file) => {
        const getObjectCommand = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: file.Key!,
        });

        const presignedUrl = await getSignedUrl(s3Client, getObjectCommand, {
          expiresIn: 3600,
        });

        return {
          key: file.Key!,
          lastModified: file.LastModified!,
          size: file.Size!,
          url: presignedUrl,
        };
      })
    );

    return {
      files,
      nextContinuationToken: response.NextContinuationToken,
      hasMore: response.IsTruncated || false,
    };
  } catch (error) {
    console.log('Error fetching user files:', error);
    throw new Error('Failed to fetch user files');
  }
};

export const getAwsSignedUrl = async (key: string) => {
  const getObjectCommand = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  });

  return await getSignedUrl(s3Client, getObjectCommand, {
    expiresIn: 3600,
  });
};
