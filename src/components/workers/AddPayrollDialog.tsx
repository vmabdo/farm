'use client';

import { useState } from 'react';
import { createPayroll } from '@/app/actions/workers';
import { X } from 'lucide-react';

export default function AddPayrollDialog({ isOpen, onClose, workers }: { isOpen: boolean; onClose: () => void; workers: any[] }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createPayroll(formData);
    setLoading(false);
    
    if (res.success) {
      onClose();
    } else {
      alert(res.error);
    }
  }

  // Only allow logging for active workers (or let them pick any, usually active only)
  const activeWorkers = workers.filter((w) => w.active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">تسجيل دفعة راتب</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">العامل *</label>
            <select
              name="workerId"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
            >
              <option value="">اختر العامل...</option>
              {activeWorkers.map((w: any) => (
                <option key={w.id} value={w.id}>
                  {w.name} (أساسي: {w.salary.toFixed(2)} ج.م)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">نوع الدفعة *</label>
            <select
              name="type"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
            >
              <option value="SALARY">راتب أساسي</option>
              <option value="BONUS">مكافأة</option>
              <option value="DEDUCTION">خصم أو سلفة</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">المبلغ الفعلي (ج.م) *</label>
            <input 
              name="amount" 
              type="number" 
              min="0"
              step="0.01"
              required 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
              placeholder="إجمالي المبلغ المنصرف"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الدفع *</label>
            <input 
              name="paymentDate" 
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
              placeholder="أسباب المكافأة، الخصم، أو الشهر..."
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
              disabled={loading || activeWorkers.length === 0}
              className="px-5 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? 'Logging...' : 'تسجيل دفعة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
