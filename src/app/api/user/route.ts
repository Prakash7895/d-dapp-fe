import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getToken } from 'next-auth/jwt';

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
