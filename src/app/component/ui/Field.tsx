'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/app/utils/cn';

const controlBase =
  'w-full rounded-md bg-ground border border-border-strong text-ink placeholder:text-ink-3 ' +
  'transition-colors duration-150 hover:border-ink-3 disabled:opacity-50 ' +
  'aria-[invalid=true]:border-critical';

type FieldShellProps = {
  label?: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
};

function FieldShell({ label, hint, error, htmlFor, children, className }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink-2">
          {label}
        </label>
      )}
      {children}
      {/* Error replaces the hint rather than stacking with it, so the field
          never grows and shifts the form as the user types. */}
      {error ? (
        <p className="text-[12px] text-critical">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, wrapperClassName, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <FieldShell
        label={label}
        hint={hint}
        error={error}
        htmlFor={inputId}
        className={wrapperClassName}
      >
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(controlBase, 'h-9 px-3 text-sm', className)}
          {...props}
        />
      </FieldShell>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, wrapperClassName, id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <FieldShell
        label={label}
        hint={hint}
        error={error}
        htmlFor={textareaId}
        className={wrapperClassName}
      >
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? true : undefined}
          className={cn(controlBase, 'px-3 py-2 text-sm resize-y min-h-20', className)}
          {...props}
        />
      </FieldShell>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, className, wrapperClassName, id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <FieldShell
        label={label}
        hint={hint}
        error={error}
        htmlFor={selectId}
        className={wrapperClassName}
      >
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          className={cn(controlBase, 'h-9 px-2.5 text-sm', className)}
          {...props}
        >
          {children}
        </select>
      </FieldShell>
    );
  }
);
Select.displayName = 'Select';
