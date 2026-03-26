'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push('/login');
    router.refresh();
  }

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-2 text-rose-400 hover:text-rose-300 font-medium px-4 py-2 hover:bg-slate-800/50 rounded-lg transition-colors"
    >
      <LogOut className="h-5 w-5 rtl:-scale-x-100" />
      تسجيل الخروج
    </button>
  );
}
