'use client';

import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { className?: string };

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`h-10 px-3 py-2 rounded-md border border-gray-300 bg-base-100 text-sm text-base-content dark:bg-base-200 dark:border-slate-700 dark:text-base-content ${
        className ?? ''
      }`}
    />
  );
}

export default Input;
