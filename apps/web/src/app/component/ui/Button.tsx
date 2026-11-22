'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/app/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-accent-fg border border-accent hover:bg-accent-hover hover:border-accent-hover',
  secondary:
    'bg-ground text-ink border border-border-strong hover:bg-surface-2',
  ghost:
    'bg-transparent text-ink-2 border border-transparent hover:bg-surface-2 hover:text-ink',
  danger:
    'bg-critical text-critical-fg border border-critical hover:opacity-90',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'secondary', size = 'md', loading, disabled, children, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap',
        'transition-colors duration-150',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />}
      {children}
    </button>
  )
);

Button.displayName = 'Button';

export default Button;
