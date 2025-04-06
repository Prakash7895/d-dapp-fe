import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { userSchema } from '@/apiSchemas';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const validationResult = userSchema.safeParse(data);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          status: 'error',
          error: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        age: data?.age,
        gender: data?.gender,
        address: data?.address,
        lastName: data?.lastName,
        firstName: data?.firstName,
        sexualOrientation: data?.sexualOrientation,
      },
    });

    return NextResponse.json(
      { status: 'success', data: user },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
  }
}
