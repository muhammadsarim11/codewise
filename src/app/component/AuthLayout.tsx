'use client';

import Link from 'next/link';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from './ui/ThemeToggle';

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-ground">
        <Link href="/landing" className="flex items-center gap-2.5">
          <div className="size-5 text-accent">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
              <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-ink">CodeWise</span>
        </Link>
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
            <p className="mt-1.5 text-[13px] text-ink-2">{subtitle}</p>
          </div>

          <div className="bg-ground border border-border rounded-lg p-6 shadow-card">
            {children}
          </div>

          <p className="mt-5 text-center text-[13px] text-ink-2">{footer}</p>
        </div>
      </div>
    </div>
  );
}

export function FormError({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 p-3 text-[13px] text-critical bg-critical-soft border border-critical/30 rounded-md"
    >
      <AlertCircle size={15} className="flex-none mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

export function FormSuccess({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="status"
      className="flex items-start gap-2 p-3 text-[13px] text-good bg-good-soft border border-good/30 rounded-md"
    >
      <CheckCircle2 size={15} className="flex-none mt-0.5" />
      <span>{children}</span>
    </div>
  );
}
