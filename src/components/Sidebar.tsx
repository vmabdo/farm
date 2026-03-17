'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartLine, Wheat, Users, Syringe, Truck, LayoutDashboard, Settings, Languages, X } from 'lucide-react';
import LogoutButton from './LogoutButton';
import { useLanguage } from './LanguageContext';
import { useSidebar } from './SidebarContext';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Cattle & Weights', href: '/cattle', icon: ChartLine },
  { name: 'Feed & Inventory', href: '/feed', icon: Wheat },
  { name: 'Workers & Payroll', href: '/workers', icon: Users },
  { name: 'Medical Care', href: '/medical', icon: Syringe },
  { name: 'Transport & Expenses', href: '/transport', icon: Truck },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useLanguage();
  const { isOpen, close } = useSidebar();

  if (pathname === '/login') return null;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 start-0 h-full w-64 z-40
          bg-slate-900 border-e border-slate-800
          flex flex-col text-white
          transition-transform duration-300 ease-in-out
          md:relative md:z-auto md:flex-shrink-0
          ${isOpen
            ? 'translate-x-0'
            : '-translate-x-full rtl:translate-x-full md:-translate-x-full md:rtl:translate-x-full'
          }
          ${!isOpen ? 'md:w-0 md:overflow-hidden md:border-0' : 'md:w-64'}
        `}
      >
        {/* Sidebar header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
          <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
            Farm ERP
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleLanguage}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition text-xs font-bold flex items-center gap-1"
              title="Toggle Language"
            >
              <Languages className="w-3.5 h-3.5" />
              {language === 'ar' ? 'EN' : 'AR'}
            </button>
            {/* Close button — mobile only */}
            <button
              onClick={close}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition md:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={close} // auto-close on mobile after navigation
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="whitespace-nowrap">{t(item.name)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 flex flex-col gap-2 border-t border-slate-800 text-sm text-slate-500 flex-shrink-0">
          <LogoutButton />
          <div className="mt-1 ps-1 border-t border-slate-800/50 pt-2 text-xs">
            <p>Premium Feedlot System</p>
            <p>&copy; {new Date().getFullYear()} Farm ERP</p>
          </div>
        </div>
      </aside>
    </>
  );
}
