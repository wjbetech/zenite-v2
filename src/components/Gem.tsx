import React from 'react';

type GemProps = {
  size?: number; // px
};

export default function Gem({ size = 64 }: GemProps) {
  const px = `${size}px`;

  return (
    <div style={{ perspective: '600px' }} className="mt-8 flex justify-center" aria-hidden>
      <div
        style={{ width: px, height: px }}
        className="transform-gpu [transform-style:preserve-3d] animate-[gemSpin_6s_linear_infinite]"
      >
        <svg
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full mx-auto block"
          role="img"
          aria-label="Spinning gem"
        >
          <defs>
            <linearGradient id="gemG1" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gemG2" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#bbf7d0" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* Main faceted shape */}
          <g fill="none" fillRule="evenodd">
            <path d="M32 4 L56 22 L48 58 L16 58 L8 22 Z" fill="url(#gemG1)" opacity="0.98" />
            <path d="M32 4 L48 22 L32 44 L16 22 Z" fill="url(#gemG2)" opacity="0.95" />

            {/* Subtle highlights to imply depth */}
            <path d="M32 44 L48 22 L56 22 L32 58 Z" fill="#ffffff" opacity="0.07" />
            <path d="M32 8 L40 20 L32 36 L24 20 Z" fill="#ffffff" opacity="0.14" />

            {/* Tiny sparkle */}
            <circle cx="50" cy="14" r="1.6" fill="#ffffff" opacity="0.9" />
          </g>
        </svg>
      </div>
    </div>
  );
}
