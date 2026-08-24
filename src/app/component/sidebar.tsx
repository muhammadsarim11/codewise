'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Folder, LogOut } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import { ThemeToggle } from './ui/ThemeToggle';
import { logout as endSession } from '../utils/api';
import { cn } from '../utils/cn';

interface SidebarProps {
  activePage: string;
  setActivePage?: (page: string) => void;
  user: { name: string; email: string } | null;
}

// Previously this list also carried "Recent" and "Settings", neither of which
// had a branch in the click handler — they were buttons that did nothing.
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { id: 'projects', label: 'Projects', icon: Folder, href: '/projects' },
];

export default function Sidebar({ activePage, setActivePage, user }: SidebarProps) {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleNavigation = (page: string, href: string) => {
    if (setActivePage) {
      setActivePage(page);
    } else {
      router.push(href);
    }
  };

  const handleLogout = async () => {
    await endSession();
    setShowLogoutConfirm(false);
    router.push('/users/signin');
  };

  return (
    <aside className="w-60 flex-none border-r border-border bg-surface flex flex-col justify-between relative z-20 h-screen">
      <div>
        <div className="h-14 flex items-center justify-between gap-3 px-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="size-5 text-accent">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <span className="font-semibold tracking-tight text-ink text-[15px]">CodeWise</span>
          </div>
          <ThemeToggle />
        </div>

        <nav className="p-3 flex flex-col gap-0.5">
          {NAV.map(({ id, label, icon: Icon, href }) => (
            <button
              key={id}
              onClick={() => handleNavigation(id, href)}
              aria-current={activePage === id ? 'page' : undefined}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium',
                'transition-colors duration-150',
                activePage === id
                  ? 'bg-accent-soft text-accent'
                  : 'text-ink-2 hover:text-ink hover:bg-surface-2'
              )}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {user && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div className="size-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs font-semibold text-ink-2">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-ink truncate">{user.name}</p>
              <p className="text-[12px] text-ink-3 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] text-ink-3 hover:text-critical hover:bg-critical-soft transition-colors duration-150"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Sign out?"
        message="You'll need to sign in again to reach your projects and analyses."
        confirmLabel="Sign out"
        danger
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </aside>
  );
}
