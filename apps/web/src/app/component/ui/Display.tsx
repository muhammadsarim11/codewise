'use client';

import { cn } from '@/app/utils/cn';

/* ------------------------------------------------------------------ Card */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ interactive, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-lg',
        interactive &&
          'transition-colors duration-150 hover:border-border-strong cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------- StatusPill */

export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

const statusStyles: Record<JobStatus, { label: string; className: string }> = {
  PENDING: { label: 'Queued', className: 'text-ink-3 border-border-strong bg-surface' },
  PROCESSING: { label: 'Analyzing', className: 'text-warn border-warn/40 bg-warn-soft' },
  COMPLETED: { label: 'Complete', className: 'text-good border-good/40 bg-good-soft' },
  FAILED: { label: 'Failed', className: 'text-critical border-critical/40 bg-critical-soft' },
};

export function StatusPill({ status, className }: { status?: string; className?: string }) {
  const key = (status ?? 'PENDING').toUpperCase() as JobStatus;
  const style = statusStyles[key] ?? statusStyles.PENDING;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        style.className,
        className
      )}
    >
      {style.label}
    </span>
  );
}

/* ----------------------------------------------------------------- Badge */

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border border-border bg-surface-2 px-1.5 py-0.5',
        'text-[11px] font-medium text-ink-2',
        className
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------ EmptyState */

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'border border-dashed border-border rounded-lg bg-surface/50 px-6 py-14',
        className
      )}
    >
      {icon && <div className="text-ink-3 mb-3">{icon}</div>}
      <p className="text-sm font-medium text-ink">{title}</p>
      {body && <p className="text-[13px] text-ink-3 mt-1 max-w-sm">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------- Skeleton */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded bg-surface-2', className)}
    />
  );
}

export function SkeletonRows({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
