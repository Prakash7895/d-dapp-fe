import { addressSchema, userSchema, userUpdateSchema } from '@/apiSchemas';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug: address } = await params;

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

    return NextResponse.json(
      { status: 'success', data: user },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: address } = await params;

    const data = await request.json();

    const validationResult = userUpdateSchema.safeParse(data);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          status: 'error',
          error: validationResult.error.errors,
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
  } catch (err) {
    console.log(err);
  }
}
