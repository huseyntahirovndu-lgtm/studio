import { NextRequest, NextResponse } from 'next/server';
import { processUpload } from '@/lib/upload-utils';

export async function POST(req: NextRequest) {
  try {
    const { files } = await processUpload(req, 'senedler');
    const file = files.file; // 'file' form sahəsinin adıdır

    if (!file) {
      return NextResponse.json({ success: false, error: 'Fayl tapılmadı' }, { status: 400 });
    }

    const newFilename = file[0].newFilename;
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://istedadmerkezi.net'}/api/senedler/${newFilename}`;

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('Sənəd yükləmə xətası:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
