'use client';

import { useState } from 'react';
import { updateCattle } from '@/app/actions/cattle';
import { X } from 'lucide-react';

export default function EditCattleDialog({ isOpen, onClose, cattle, breeds = [] }: { isOpen: boolean; onClose: () => void; cattle: any; breeds?: any[] }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateCattle(cattle.id, formData);
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
          <h2 className="text-xl font-bold text-slate-800">تعديل بيانات العجل</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">رقم العجل *</label>
            <input 
              name="tagNumber" 
              required 
              defaultValue={cattle.tagNumber}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">السلالة</label>
            <select
              name="breedId"
              required 
              defaultValue={cattle.breedId || ''}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white" 
            >
              <option value="" disabled hidden>اختر السلالة...</option>
              {breeds.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.pricePerKg} ج.م/كجم)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الدخول *</label>
            <input 
              name="entryDate" 
              type="date" 
              required 
              defaultValue={new Date(cattle.entryDate).toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الحالة *</label>
              <select
                name="status"
                required
                defaultValue={cattle.status}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
              >
                <option value="ACTIVE">القطيع النشط</option>
                {cattle.status === 'SOLD' && <option value="SOLD">مُباع</option>}
                <option value="DECEASED">نافق</option>
              </select>
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
              {loading ? 'جاري الحفظ...' : 'تعديل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
