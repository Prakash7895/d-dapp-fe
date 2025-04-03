import { NextResponse } from 'next/server';
import { pinata } from '../../../../utils/config';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'File and URL are required' },
        { status: 400 }
      );
    }

    const upload = await pinata.upload.public.file(file);
    const fileUrl = await pinata.gateways.public.convert(upload.cid);
    const pin = await pinata.upload.public.cid(upload.cid);

    console.log('upload', upload);
    // console.log('pin', pin);
    console.log('fileUrl', fileUrl);

    return NextResponse.json({ fileUrl });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'Failed to upload to Pinata' },
      { status: 500 }
    );
  }
}
