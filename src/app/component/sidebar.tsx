'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Folder,
  Clock,
  Settings,
  LogOut
} from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

interface SidebarProps {
  activePage: string;
  setActivePage?: (page: string) => void;
  user: { name: string; email: string } | null;
}

export default function Sidebar({ activePage, setActivePage, user }: SidebarProps) {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleNavigation = (page: string) => {
    if (setActivePage) {
      // If we are in a controlled environment (like Home), just switch state
      setActivePage(page);
    } else {
      // If we are on a standalone page, route accordingly
      if (page === 'dashboard') router.push('/');
      if (page === 'projects') router.push('/projects'); // Assuming you might have a route
      // Add other routes as needed
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setShowLogoutConfirm(false);
    router.push('/users/signin');
  };

  return (
    <aside className="w-64 flex-none border-r border-[#333333] bg-[#000000] flex flex-col justify-between relative z-20 h-screen">
      <div>
         {/* Logo Area */}
         <div className="h-16 flex items-center gap-3 px-6 border-b border-[#333333]">
            <div className="size-6 text-white">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <span className="font-mono font-semibold tracking-tight text-white">CodeWise</span>
         </div>

         {/* Navigation */}
         <nav className="p-4 space-y-1">
           <button 
              onClick={() => handleNavigation('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-mono transition-colors ${activePage === 'dashboard' ? 'bg-[#111] text-white' : 'text-[#888] hover:text-white hover:bg-[#111]'}`}
           >
              <LayoutDashboard size={16} /> Dashboard
           </button>
           <button 
              onClick={() => handleNavigation('projects')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-mono transition-colors ${activePage === 'projects' ? 'bg-[#111] text-white' : 'text-[#888] hover:text-white hover:bg-[#111]'}`}
           >
              <Folder size={16} /> Projects
           </button>
           <button 
              onClick={() => handleNavigation('recent')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-mono transition-colors ${activePage === 'recent' ? 'bg-[#111] text-white' : 'text-[#888] hover:text-white hover:bg-[#111]'}`}
           >
              <Clock size={16} /> Recent
           </button>
           <button 
              onClick={() => handleNavigation('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-mono transition-colors ${activePage === 'settings' ? 'bg-[#111] text-white' : 'text-[#888] hover:text-white hover:bg-[#111]'}`}
           >
              <Settings size={16} /> Settings
           </button>
         </nav>
      </div>

      {/* User Footer */}
      {user && (
          <div className="p-4 border-t border-[#333333]">
              <div className="flex items-center gap-3 mb-4 px-2">
                  <div className="size-8 rounded-full bg-[#333] flex items-center justify-center text-xs font-mono font-medium text-white border border-[#444]">
                      {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-[#666] truncate font-mono">{user.email}</p>
                  </div>
              </div>
              <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-mono text-[#888] hover:text-red-400 hover:bg-red-900/10 transition-colors"
              >
                  <LogOut size={14} /> Sign Out
              </button>
          </div>
      )}

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Log out?"
        message="You'll need to sign in again to access your projects and analyses."
        confirmLabel="Log Out"
        danger
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </aside>
  );
}