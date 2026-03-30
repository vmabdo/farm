'use client';

import { useState } from 'react';
import { createWorker } from '@/app/actions/workers';
import { X } from 'lucide-react';

export default function AddWorkerDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createWorker(formData);
    setLoading(false);
    
    if (res.success) {
      onClose();
    } else {
      alert(res.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full animate-in fade-in zoom-in-95 duration-300 max-w-md overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">إضافة عامل جديد</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الاسم بالكامل *</label>
            <input 
              name="name" 
              required 
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
              placeholder="مثال: أحمد محمد"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الرقم القومي *</label>
            <input 
              name="nationalId" 
              required 
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
              placeholder="مثال: 123456789"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الوظيفة *</label>
            <input 
              name="role" 
              required 
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
              placeholder="مثال: عامل مزرعة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الراتب الأساسي (ج.م) *</label>
            <input 
              name="salary" 
              type="number" 
              min="0"
              step="0.01"
              required 
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف</label>
            <input 
              name="phone" 
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
              placeholder="مثال: 01012345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ البدء *</label>
            <input 
              name="startDate" 
              type="date" 
              required 
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
            />
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition"
            >إلغاء</button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'إضافة عامل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
