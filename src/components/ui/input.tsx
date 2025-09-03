'use client';

import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { className?: string };

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-900 dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100 ${
        className ?? ''
      }`}
    />
  );
}

export default Input;
