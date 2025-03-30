import { NextResponse } from 'next/server';
import { pinata } from '../../../../utils/config';

export async function GET() {
  try {
    const url = await pinata.upload.public.createSignedURL({
      expires: 60 * 2,
    });
    return NextResponse.json({ url }, { status: 200 });
  } catch (err) {
    console.log(err);
  }
}
