import { userUpdateSchema } from '@/apiSchemas';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateUser } from '@/lib/user';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    const user = await prisma.user.findFirst({
      where: {
        id: +id,
      },
    });

    if (user) {
      const { password, ...userInfo } = user;

      return NextResponse.json(
        { status: 'success', data: userInfo },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { status: 'error', message: 'User not found' },
      { status: 400 }
    );
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(
      { status: 'error', message: err?.message },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    const data = await request.json();

    const validationResult = userUpdateSchema.safeParse(data);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          status: 'error',
          error: validationResult.error?.errors,
        },
        { status: 400 }
      );
    }

    const userInfo = await updateUser(+id, validationResult.data);

    return NextResponse.json(
      { status: 'success', data: userInfo },
      { status: 201 }
    );
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(
      { status: 'error', message: err?.message || 'Unknown error' },
      { status: 400 }
    );
  }
}
