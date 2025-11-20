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
    const uploadsPath = join(process.cwd(), 'api');
    const path = join(uploadsPath, filename);
    
    // Ensure the directory exists
    await mkdir(uploadsPath, { recursive: true });

    await writeFile(path, buffer);
    console.log(`File uploaded to ${path}`);

    // Return a URL that points to our new file serving API
    const fileUrl = `/api/files/view/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error saving file';
    console.error('Error handling file upload:', error);
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
