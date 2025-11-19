import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Logo(props: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="https://i.ibb.co/3k5g75s/logo-white.png"
      alt="Naxçıvan Dövlət Universiteti Logo"
      {...props}
      className={cn("h-10 w-auto", props.className)}
    />
  );
}
