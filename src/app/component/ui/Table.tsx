'use client';

import { cn } from '@/app/utils/cn';

/**
 * A table wrapper that always scrolls inside its own container, so a wide row
 * never makes the whole page scroll sideways.
 */
export function Table({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('overflow-x-auto border border-border rounded-lg', className)}>
      <table className="w-full border-collapse text-sm min-w-[560px]">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-surface-2">{children}</thead>;
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TR({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-b border-border last:border-b-0',
        onClick && 'cursor-pointer transition-colors duration-150 hover:bg-surface',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TH({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        'text-left font-medium text-[12px] text-ink-3 px-4 py-2.5',
        'border-b border-border whitespace-nowrap',
        className
      )}
    >
      {children}
    </th>
  );
}

export function TD({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn('px-4 py-3 text-ink-2 align-middle', className)}>{children}</td>
  );
}
