'use client';

import { useState } from 'react';
import { createFeedConsumption } from '@/app/actions/feed';
import { X } from 'lucide-react';

export default function AddConsumptionDialog({ isOpen, onClose, items }: { isOpen: boolean; onClose: () => void; items: any[] }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createFeedConsumption(formData);
    setLoading(false);
    
    if (res.success) {
      onClose();
    } else {
      alert(res.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">تسجيل استهلاك العلف</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">نوع العلف *</label>
            <select
              name="feedItemId"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
            >
              <option value="">حدد نوع العلف...</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} (المخزون المتوفر: {item.currentStock} {item.unit})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الكمية المستهلكة *</label>
            <div className="flex gap-2">
              <input 
                name="quantity" 
                type="number" 
                min="0"
                step="0.01"
                required 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
                placeholder="الكمية المستخدمة..."
              />
              <select
                name="unit"
                required
                className="w-32 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
              >
                <option value="KG">KG</option>
                <option value="TON">TON</option>
                <option value="BAG">BAG</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الاستهلاك *</label>
            <input 
              name="date" 
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات</label>
            <textarea 
              name="notes"
              rows={2} 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none" 
              placeholder="أضف أي تفاصيل أخرى..."
            />
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition"
            >إلغاء</button>
            <button 
              type="submit" 
              disabled={loading || items.length === 0}
              className="px-5 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? 'جاري المعالجة...' : 'سجل الاستهلاك'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
