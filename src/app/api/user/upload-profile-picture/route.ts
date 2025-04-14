import { fileUploadSchema } from '@/apiSchemas';
import { deleteFileFromS3, uploadFileToS3 } from '@/lib/aws';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      throw new Error('Not Authenticated');
    }

    const id = +token.id;
    const formData = await request.formData();
    const _file = formData.get('file') as File | null;

    const vResUserUpdate = fileUploadSchema
      .pick({ file: true })
      .safeParse({ file: _file });

    if (!vResUserUpdate.success) {
      return NextResponse.json(
        {
          status: 'error',
          error: vResUserUpdate.error?.errors,
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        id,
      },
    });

    const { file } = vResUserUpdate.data;

    const profilePicture = await uploadFileToS3(file, id);

    if (profilePicture) {
      const userInfo = await prisma.user.update({
        where: {
          id,
        },
        data: {
          profilePicture,
        },
      });

      if (user?.profilePicture) {
        await deleteFileFromS3(user.profilePicture);
      }

      const { password, ..._user } = userInfo;

      return NextResponse.json(
        { status: 'success', data: _user },
        { status: 200 }
      );
    } else {
      throw new Error('No data to update');
    }
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(
      { status: 'error', message: err?.message },
      { status: 400 }
    );
  }
}
