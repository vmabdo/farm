'use client';

import { useState } from 'react';
import { changePassword } from '@/app/actions/auth';
import { Key } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match.', type: 'error' });
      setLoading(false);
      return;
    }

    const res = await changePassword(formData);
    
    if (res.success) {
      setMessage({ text: 'Password updated successfully.', type: 'success' });
      (e.target as HTMLFormElement).reset();
    } else {
      setMessage({ text: res.error || 'Failed to update.', type: 'error' });
    }
    
    setLoading(false);
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 mt-2">Manage your administrative credentials and secure access.</p>
      </header>

      <div className="bg-white rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Change Admin Password</h2>
            <p className="text-sm text-slate-500">Update the login password for the system.</p>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center justify-center text-center ${message.type === 'error' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Admin Username</label>
            <input 
              name="username" 
              type="text" 
              required 
              defaultValue="admin"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Current Password *</label>
            <input 
              name="currentPassword" 
              type="password" 
              required 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
            />
          </div>

          <div className="border-t border-slate-100 pt-5 mt-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1">New Password *</label>
            <input 
              name="newPassword" 
              type="password" 
              required 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password *</label>
            <input 
              name="confirmPassword" 
              type="password" 
              required 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-700/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating Credentials...' : 'Save New Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
