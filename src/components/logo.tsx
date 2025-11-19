import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Logo(props: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="https://www.ndu.edu.az/storage/news-blogs/June2024/95Zn8wUEkI1lEufH67Gi.png"
      alt="Naxçıvan Dövlət Universiteti Logo"
      {...props}
      className={cn("h-12 w-12", props.className)}
    />
  );
}
