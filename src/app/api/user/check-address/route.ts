import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { addWalletAddressSchema } from '@/apiSchemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = await addWalletAddressSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          status: 'error',
          error: validationResult.error?.errors,
        },
        { status: 400 }
      );
    }

    const address = validationResult.data.selectedAddress;

    const token = await getToken({ req: request });

    if (!token) {
      return NextResponse.json(
        { status: 'error', message: 'Not authenticated' },
        { status: 400 }
      );
    }

    const currentUserId = +token.id;

    // Check if the address exists in any user's linkedAddresses
    const userWithAddress = await prisma.user.findFirst({
      where: {
        linkedAddresses: {
          array_contains: [address.toLowerCase()],
          mode: 'insensitive',
        },
        NOT: {
          id: currentUserId,
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    return NextResponse.json(
      {
        status: 'success',
        data: {
          isTaken: !!userWithAddress,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Error checking address:', err);
    return NextResponse.json(
      { status: 'error', message: err?.message || 'Failed to check address' },
      { status: 400 }
    );
  }
}
