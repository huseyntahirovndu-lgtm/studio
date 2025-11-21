'use server';

import { NextRequest } from 'next/server';
import { Formidable } from 'formidable';
import fs from 'fs';
import path from 'path';

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

// Fayl yükləmə prosesini idarə edən əsas funksiya
export const processUpload = async (req: NextRequest, uploadDir: 'sekiller' | 'senedler') => {
  const targetDir = path.join(process.cwd(), 'uploads', uploadDir);

  // Əgər qovluq yoxdursa, yarat
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const form = new Formidable({
    uploadDir: targetDir,
    keepExtensions: true,
    maxFileSize: 20 * 1024 * 1024, // 20 MB
    filename: (name, ext, part) => {
      const originalName = part.originalFilename || 'fayl';
      const safeName = slugify(path.parse(originalName).name);
      const timestamp = Date.now();
      return `${safeName}_${timestamp}${ext}`;
    },
  });

  return new Promise<{ fields: any; files: any }>((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      resolve({ fields, files });
    });
  });
};
