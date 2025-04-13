import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { getAwsSignedUrl, uploadFile } from '@/lib/aws';
import { fileUploadSchema } from '@/apiSchemas';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: +session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const _file = formData.get('file') as File | null;
    const _access = (formData.get('access') as string | null) ?? 'PUBLIC';

    const validationResult = fileUploadSchema.safeParse({
      file: _file,
      access: _access,
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

    const { access, file } = validationResult.data;

    const s3Key = await uploadFile(file, +session.user.id);

    const userFile = await prisma.userFile.create({
      data: {
        userId: user.id,
        s3Key,
        access,
      },
    });

    const signedUrl = await getAwsSignedUrl(s3Key);

    return NextResponse.json({
      success: 'success',
      data: {
        id: userFile.id,
        url: signedUrl,
      },
    });
  } catch (error: any) {
    console.log('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', message: error.message },
      { status: 500 }
    );
  }
}
