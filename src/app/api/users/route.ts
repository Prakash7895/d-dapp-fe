import { FILE_ACCESS, paginationQuerySchema } from '@/apiSchemas';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      throw new Error('Not Authenticated');
    }

    const searchParams = new URL(request.url).searchParams;
    const pageSize = +searchParams.get('pageSize')!;
    const pageNo = +searchParams.get('pageNo')!;

    const validationResult = paginationQuerySchema.safeParse({
      pageNo,
      pageSize,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          status: 'error',
          error: validationResult.error?.errors,
        },
        { status: 400 }
      );
    }

    const skip = (pageNo - 1) * pageSize;

    const users = await prisma.user.findMany({
      where: { id: { not: { equals: +token.id } } },
      skip,
      take: pageSize,
      orderBy: {
        lastActiveOn: 'desc',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        age: true,
        gender: true,
        sexualOrientation: true,
        bio: true,
        interests: true,
        city: true,
        country: true,
        maxDistance: true,
        minAge: true,
        maxAge: true,
        genderPreference: true,
        profilePicture: true,
        lastActiveOn: true,

        files: {
          where: {
            access: FILE_ACCESS.PUBLIC,
          },
          orderBy: {
            updatedAt: 'desc',
          },
          select: {
            s3Key: true,
          },
        },
      },
    });

    const total = await prisma.user.count({
      where: { id: { not: { equals: +token.id } } },
    });

    return NextResponse.json(
      {
        status: 'success',
        data: {
          users: users.map((el) => {
            const photos = el.files.map((e) => e.s3Key);
            const { files, ...dt } = el;

            return {
              ...dt,
              photos,
            };
          }),
          total,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(
      { status: 'error', message: err?.message },
      { status: 400 }
    );
  }
}
