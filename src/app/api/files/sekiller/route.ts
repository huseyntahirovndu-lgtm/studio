import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
  }

  try {
    // We will now upload to a third-party hosting service like imgbb
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const imgbbFormData = new FormData();
    imgbbFormData.append('image', buffer.toString('base64'));

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      throw new Error("ImgBB API key is not defined. Please add NEXT_PUBLIC_IMGBB_API_KEY to your .env file.");
    }

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: imgbbFormData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error('ImgBB upload failed:', result);
      throw new Error(result?.error?.message || 'Error uploading to ImgBB');
    }

    const fileUrl = result.data.url;
    return NextResponse.json({ success: true, url: fileUrl });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error saving file';
    console.error('Error handling file upload:', error);
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
