'use client';

import React from 'react';

// tiny className joiner to avoid an external dependency
function cn(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(' ');
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'ghost';
};

export function Button({ variant = 'default', className, ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors px-3 py-1';
  const variants: Record<string, string> = {
    default:
      'bg-white border text-gray-700 hover:bg-gray-50 border-gray-200 cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100 dark:hover:bg-slate-700',
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer',
    ghost:
      'bg-transparent text-gray-700 hover:bg-gray-100 cursor-pointer dark:text-gray-200 dark:hover:bg-slate-800',
  };

  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export default Button;
