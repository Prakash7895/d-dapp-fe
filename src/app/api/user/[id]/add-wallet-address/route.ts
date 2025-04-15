import { addWalletAddressSchema } from '@/apiSchemas';
import { updateUser } from '@/lib/user';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    const body = await request.json();

    const validationResult = addWalletAddressSchema.safeParse(body);

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
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { status: 'error', message: (err as Error)?.message },
      { status: 400 }
    );
  }
}
