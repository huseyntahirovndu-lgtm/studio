import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const publicPath = join(process.cwd(), 'public', 'sekiller');
    const path = join(publicPath, filename);
    
    // Ensure the directory exists
    await mkdir(publicPath, { recursive: true });

    await writeFile(path, buffer);
    console.log(`File uploaded to ${path}`);

    const fileUrl = `/sekiller/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error saving file';
    console.error('Error handling file upload:', error);
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
