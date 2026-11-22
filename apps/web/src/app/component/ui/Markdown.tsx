'use client';

import ReactMarkdown from 'react-markdown';
import { cn } from '@/app/utils/cn';

/**
 * Renders AI-generated markdown with the app's tokens.
 *
 * This replaces the hand-rolled parser that both the explanation and share
 * pages carried — they split each line on backticks and alternated array
 * indices, which handled inline code and nothing else: lists, bold, and fenced
 * blocks all came through as literal characters.
 */
export function Markdown({
  children,
  className,
  variant = 'compact',
}: {
  children?: string | null;
  className?: string;
  /** `doc` scales the type up for full-page documentation. */
  variant?: 'compact' | 'doc';
}) {
  if (!children?.trim()) {
    return <p className="text-[13px] text-ink-3 italic">Not provided.</p>;
  }

  const isDoc = variant === 'doc';

  return (
    <div
      className={cn(
        isDoc ? 'text-[15px] text-ink-2 leading-[1.7]' : 'text-sm text-ink-2 leading-relaxed',
        className
      )}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className={isDoc ? 'mb-5 last:mb-0' : 'mb-3 last:mb-0'}>{children}</p>,
          h1: ({ children }) => (
            <h3
              className={cn(
                'font-semibold text-ink first:mt-0',
                isDoc ? 'text-[22px] mt-10 mb-4 tracking-tight' : 'text-[15px] mt-5 mb-2'
              )}
            >
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3
              className={cn(
                'font-semibold text-ink first:mt-0',
                isDoc ? 'text-[19px] mt-9 mb-3 tracking-tight' : 'text-[15px] mt-5 mb-2'
              )}
            >
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4
              className={cn(
                'font-semibold text-ink first:mt-0',
                isDoc ? 'text-[16px] mt-7 mb-2.5' : 'text-sm mt-4 mb-1.5'
              )}
            >
              {children}
            </h4>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-3 space-y-1.5 marker:text-ink-3">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1.5 marker:text-ink-3">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-ink">{children}</strong>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent underline underline-offset-2"
            >
              {children}
            </a>
          ),
          code: ({ className: codeClass, children }) => {
            // react-markdown marks fenced blocks with a language- class; plain
            // inline code has none.
            const isBlock = Boolean(codeClass);

            if (isBlock) {
              return (
                <code className="block font-mono text-[12.5px] leading-relaxed">
                  {children}
                </code>
              );
            }

            return (
              <code className="font-mono text-[0.875em] bg-surface-2 border border-border rounded px-1 py-0.5 text-ink">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-surface-2 border border-border rounded-md p-3 mb-3 overflow-x-auto text-ink-2">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-border-strong pl-3 text-ink-3 mb-3">
              {children}
            </blockquote>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export default Markdown;
