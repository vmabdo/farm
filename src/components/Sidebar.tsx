'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartLine, Wheat, Users, Syringe, Truck, LayoutDashboard, Settings, Languages } from 'lucide-react';
import LogoutButton from './LogoutButton';
import { useLanguage } from './LanguageContext';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Cattle & Weights', href: '/cattle', icon: ChartLine },
  { name: 'Feed & Inventory', href: '/feed', icon: Wheat },
  { name: 'Workers & Payroll', href: '/workers', icon: Users },
  { name: 'Medical Care', href: '/medical', icon: Syringe },
  { name: 'Transport & Expenses', href: '/transport', icon: Truck },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useLanguage();

  if (pathname === '/login') return null;

  return (
    <aside className={`w-64 bg-slate-900 border-x border-slate-800 flex-shrink-0 flex flex-col h-full text-white ${className}`}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Farm ERP
        </h1>
        <button
          onClick={toggleLanguage}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center gap-2 text-xs font-bold"
          title="Toggle Language (English / Arabic)"
        >
          <Languages className="w-4 h-4" />
          {language === 'ar' ? 'EN' : 'AR'}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{t(item.name)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 flex flex-col gap-2 border-t border-slate-800 text-sm text-slate-500">
        <LogoutButton />
        <div className="mt-2 ps-4 border-t border-slate-800/50 pt-2">
          <p>Premium Feedlot System</p>
          <p>&copy; {new Date().getFullYear()} Farm ERP</p>
        </div>
      </div>
    </aside>
  );
}
