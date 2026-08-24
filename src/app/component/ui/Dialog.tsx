'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/app/utils/cn';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** Widens the panel for content-heavy dialogs such as share links. */
  size?: 'sm' | 'md';
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// The close button lives in the header, ahead of the dialog's own content, so a
// bare FOCUSABLE query hands it the initial focus. A form dialog should open in
// its first field instead.
const FIELDS =
  'input:not([disabled]), textarea:not([disabled]), select:not([disabled])';

const isVisible = (el: HTMLElement) => el.offsetParent !== null;

/**
 * The one dialog in the app. Replaces three hand-rolled implementations that
 * each missed something different — focus trapping, Escape, or scroll lock.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'sm',
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  // Callers rebuild onClose on every render, so the setup effect below must not
  // depend on its identity. It used to, which tore the dialog down and refocused
  // it on every keystroke — throwing the caret onto the close button mid-word.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      // Keep Tab inside the panel: without this, focus walks off into the page
      // behind the overlay, which is invisible but still reachable.
      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter(isVisible);

      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    restoreFocusTo.current = document.activeElement as HTMLElement | null;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    // Move focus into the panel so a keyboard user starts inside the dialog.
    const timer = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;

      const field = Array.from(panel.querySelectorAll<HTMLElement>(FIELDS)).find(isVisible);
      (field ?? panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel).focus();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflow;
      restoreFocusTo.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/25 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'w-full bg-ground border border-border rounded-lg shadow-float outline-none',
          size === 'sm' ? 'max-w-sm' : 'max-w-lg'
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
            {description && (
              <p className="text-[13px] text-ink-2 mt-1 leading-relaxed">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-ink-3 hover:text-ink transition-colors rounded p-0.5 -mr-1 -mt-0.5"
          >
            <X size={17} />
          </button>
        </div>

        {children && <div className="px-5 pb-4">{children}</div>}

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dialog;
