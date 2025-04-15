import { FILE_ACCESS, PaginationQuerySchemaType } from '@/apiSchemas';
import { prisma } from './prisma';
import { getAwsSignedUrls } from './aws';

export const getUserFiles = async ({
  pageNo,
  pageSize,
  userId,
  isMatched,
}: PaginationQuerySchemaType & { userId: number; isMatched: boolean }) => {
  const skip = (pageNo - 1) * 10;

  const userFile = await prisma.userFile.findMany({
    where: {
      userId: +userId,
      ...(isMatched ? {} : { access: FILE_ACCESS.PUBLIC }),
    },
    skip,
    take: pageSize,
    select: {
      access: true,
      s3Key: true,
      id: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const signedUrls = await getAwsSignedUrls(userFile.map((el) => el.s3Key));

  return signedUrls.map((el) => {
    const f = userFile.find((f) => f.s3Key === el.key)!;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { s3Key, ...f1 } = f;
    return {
      ...el,
      ...f1,
    };
  });
};
