import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Limiti 50MB-a qaldır
    },
  },
};

// Fayl adını təhlükəsiz formata salmaq üçün funksiya
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Boşluqları defislə əvəz et
    .replace(/[^\w\-]+/g, '')       // Bütün qeyri-söz simvollarını sil
    .replace(/\-\-+/g, '-');        // Çoxlu defisləri tək defislə əvəz et
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ success: false, error: 'Fayl tapılmadı' }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), 'uploads', 'sekiller');

  // Əgər qovluq yoxdursa, yarat
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Yeni, unikal fayl adı yarat
  const originalName = file.name || 'fayl';
  const safeName = slugify(path.parse(originalName).name);
  const timestamp = Date.now();
  const extension = path.extname(originalName);
  const newFilename = `${safeName}_${timestamp}${extension}`;
  const filePath = path.join(uploadDir, newFilename);

  try {
    // Faylı buffer-ə çevir və yadda saxla
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://istedadmerkezi.net'}/api/sekiller/${newFilename}`;

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('Şəkil yükləmə xətası:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
