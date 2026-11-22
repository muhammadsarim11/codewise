'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { cn } from '@/app/utils/cn';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The server cannot know the viewer's theme, so render the frame on the
  // server and the icon only once the client knows which one is active.
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
      className={cn(
        'inline-flex items-center justify-center w-8 h-8 rounded-md',
        'text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors duration-150',
        className
      )}
    >
      {mounted && (theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />)}
    </button>
  );
}

export default ThemeToggle;
