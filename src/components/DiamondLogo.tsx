import React from 'react';

type Props = React.SVGProps<SVGSVGElement> & { title?: string };

export default function DiamondLogo({ className, title = 'Zenite logo', ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : 'true'}
      role="img"
      className={className}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#bff7df" />
          <stop offset="40%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="g2" x1="1" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#9ef6d3" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#34d399" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      {/* outer silhouette */}
      <path d="M12 2 L20 8 L18 16 L12 22 L6 16 L4 8 Z" fill="url(#g2)" />

      {/* top facet */}
      <path d="M12 2 L16.5 7.5 L12 9 L7.5 7.5 Z" fill="url(#g1)" opacity="0.98" />

      {/* left facets */}
      <path d="M7.5 7.5 L12 9 L10 13 L6 11 Z" fill="#6ee7b7" opacity="0.95" />
      <path d="M6 11 L10 13 L8 17 L4 8 Z" fill="#34d399" opacity="0.95" />

      {/* right facets */}
      <path d="M16.5 7.5 L12 9 L14 13 L18 11 Z" fill="#a7f3d0" opacity="0.9" />
      <path d="M18 11 L14 13 L16 17 L20 8 Z" fill="#10b981" opacity="0.95" />

      {/* bottom center facet */}
      <path d="M10 13 L14 13 L12 22 Z" fill="#047857" opacity="0.98" />

      {/* soft highlight */}
      <ellipse cx="9.5" cy="6.5" rx="1.8" ry="0.9" fill="#ffffff" opacity="0.12" />

      {/* subtle outline for clarity */}
      <path
        d="M12 2 L20 8 L18 16 L12 22 L6 16 L4 8 Z"
        fill="none"
        stroke="#064e3b"
        strokeWidth="0.4"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}
