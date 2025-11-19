import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width="40"
      height="40"
      aria-label="Naxçıvan Dövlət Universiteti Logo"
      {...props}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--secondary))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="none" stroke="url(#grad1)" strokeWidth="10" />
      <path
        d="M100 30 L125 75 L175 75 L137.5 105 L150 155 L100 125 L50 155 L62.5 105 L25 75 L75 75 Z"
        fill="url(#grad1)"
        transform="rotate(0 100 100)"
      />
      <text
        x="100"
        y="110"
        fontFamily="serif"
        fontSize="50"
        fill="hsl(var(--primary-foreground))"
        textAnchor="middle"
        dy=".3em"
        fontWeight="bold"
      >
        N
      </text>
    </svg>
  );
}
