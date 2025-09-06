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
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors px-2 py-1';
  const variants: Record<string, string> = {
    default:
      'bg-base-100 border text-base-content hover:bg-base-200 border-gray-200 cursor-pointer',
    primary: 'bg-primary text-primary-content hover:bg-primary-focus cursor-pointer',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 cursor-pointer',
  };

  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export default Button;
