import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { fileKeySchema } from '@/apiSchemas';
import { getAwsSignedUrl } from '@/lib/aws';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const key = (await params).key;

    const validationResult = fileKeySchema.safeParse({ key });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          status: 'error',
          error: validationResult.error?.errors,
        },
        { status: 400 }
      );
    }

    const signedUrl = await getAwsSignedUrl(key);

    return NextResponse.json(
      {
        status: 'success',
        data: signedUrl,
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
