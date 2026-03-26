'use client';
import { Menu } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { usePathname } from 'next/navigation';

export default function TopBar() {
  const { toggle } = useSidebar();
  const pathname = usePathname();

  // Don't show the topbar on the login page
  if (pathname === '/login') return null;

  return (
    <header className="h-14 flex-shrink-0 bg-white border-b border-slate-200 flex items-center px-4 gap-3 z-20 relative print:hidden">
      <button
        onClick={toggle}
        aria-label="Toggle sidebar"
        className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>
      <span className="text-sm font-semibold text-slate-700">
        نظام إدارة المزرعة
      </span>
    </header>
  );
}
