import React from 'react';

type Variant = 'primary' | 'success' | 'accent' | 'muted';

export default function Spinner({ variant = 'accent' }: { variant?: Variant }) {
  const colorClass =
    variant === 'primary'
      ? 'text-primary'
      : variant === 'success'
      ? 'text-success'
      : variant === 'muted'
      ? 'text-base-content/40'
      : 'text-accent';

  return (
    <svg
      className={`animate-spin h-10 w-10 ${colorClass}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}
