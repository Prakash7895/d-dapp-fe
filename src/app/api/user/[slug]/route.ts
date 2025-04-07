import { addressSchema, userUpdateSchema } from '@/apiSchemas';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const address = (await params).slug;

    const validationResult = addressSchema.safeParse(address);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          status: 'error',
          error: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        address: address!,
      },
    });

    if (user) {
      return NextResponse.json(
        { status: 'success', data: user },
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const address = (await params).slug;

    const data = await request.json();

    const validationResult1 = addressSchema.safeParse(address);
    const validationResult2 = userUpdateSchema.safeParse(data);

    if (!validationResult1.success || !validationResult2.success) {
      return NextResponse.json(
        {
          status: 'error',
          error:
            validationResult1.error?.errors || validationResult2.error?.errors,
        },
        { status: 400 }
      );
    }

    delete data.address;

    const user = await prisma.user.update({
      where: {
        address: address,
      },
      data: data,
    });

    return NextResponse.json(
      { status: 'success', data: user },
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
