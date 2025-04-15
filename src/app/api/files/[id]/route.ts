import { fileUploadSchema } from '@/apiSchemas';
import { authOptions } from '@/lib/authOptions';
import { deleteFileFromS3 } from '@/lib/aws';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const fileId = (await params).id;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userFile = await prisma.userFile.findFirst({
      where: {
        id: +fileId,
        userId: +session.user.id,
      },
      select: {
        s3Key: true,
        userId: true,
      },
    });

    if (!userFile) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'File not found.',
        },
        { status: 400 }
      );
    }

    const { success } = await deleteFileFromS3(userFile.s3Key!);
    await prisma.userFile.delete({
      where: {
        id: +fileId,
      },
    });
    if (success) {
      return NextResponse.json(
        {
          status: 'success',
          message: 'File deleted successfully.',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fileId = (await params).id;

    const data = await request.json();

    const validationResult = fileUploadSchema
      .pick({ access: true })
      .safeParse(data);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          status: 'error',
          error: validationResult.error?.errors,
        },
        { status: 400 }
      );
    }
    const { access } = validationResult.data;

    const userFile = await prisma.userFile.update({
      where: {
        id: +fileId,
        userId: +session.user.id,
      },
      data: {
        access,
      },
    });

    if (!userFile) {
      return NextResponse.json({
        status: 'error',
        message: 'File not found.',
      });
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'File Access updated successfully.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.log('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 400 }
    );
  }
}
