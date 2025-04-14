import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { updatePasswordSchema, userUpdateSchema } from '@/apiSchemas';
import { updateUser } from '@/lib/user';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      throw new Error('Not Authenticated');
    }

    const id = +token.id;

    const user = await prisma.user.findFirst({
      where: {
        id: +id,
      },
    });

    if (user) {
      const { password, ...userInfo } = user;

      return NextResponse.json(
        { status: 'success', data: userInfo },
        { status: 200 }
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

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      throw new Error('Not Authenticated');
    }

    const id = +token.id;
    const data = await request.json();

    const vResUserUpdate = userUpdateSchema.safeParse(data);
    const vResPasswordUpdate = updatePasswordSchema.safeParse(data);

    if (!vResUserUpdate.success && !vResPasswordUpdate.success) {
      return NextResponse.json(
        {
          status: 'error',
          error: !vResUserUpdate.success
            ? vResUserUpdate.error?.errors
            : vResPasswordUpdate.error.errors,
        },
        { status: 400 }
      );
    }

    const dataToUpdate = vResUserUpdate.success
      ? vResUserUpdate.data
      : vResPasswordUpdate.success
      ? vResPasswordUpdate.data
      : null;

    if (dataToUpdate) {
      const userInfo = await updateUser(+id, dataToUpdate);

      return NextResponse.json(
        { status: 'success', data: userInfo },
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
