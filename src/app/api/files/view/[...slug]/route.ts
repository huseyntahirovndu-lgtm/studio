import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { lookup } from 'mime-types';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug;
  if (!slug || !Array.isArray(slug) || slug.length === 0) {
    return new NextResponse('Invalid file path', { status: 400 });
  }

  const filename = slug.join('/');
  const filePath = join(process.cwd(), 'uploads', filename);

  try {
    const fileBuffer = await readFile(filePath);
    const mimeType = lookup(filename) || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    // Check if the error is a file not found error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return new NextResponse('File not found', { status: 404 });
    }
    // For other errors, return a generic server error
    console.error(`Error reading file ${filePath}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
