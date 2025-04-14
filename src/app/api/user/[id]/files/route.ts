import { paginationQuerySchema } from '@/apiSchemas';
import { authOptions } from '@/lib/authOptions';
import { getUserFiles } from '@/lib/userFiles';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = (await params).id;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const pageSize = +searchParams.get('pageSize')!;
    const pageNo = +searchParams.get('pageNo')!;

    const validationResult = paginationQuerySchema.safeParse({
      pageNo,
      pageSize,
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

    const isMatched = true;

    const signedUrls = await getUserFiles({
      pageNo,
      pageSize,
      userId: +userId,
      isMatched,
    });

    return NextResponse.json(
      {
        status: 'success',
        data: signedUrls,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 400 }
    );
  }
}
