'use client';

import { useState } from 'react';
import { addWeightRecord } from '@/app/actions/cattle';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function WeightDialog({ isOpen, onClose, cattle }: { isOpen: boolean; onClose: () => void; cattle: any }) {
  const [loading, setLoading] = useState(false);
  const [newWeight, setNewWeight] = useState<number | ''>('');

  if (!isOpen) return null;

  const previousWeight = cattle.currentWeight || cattle.entryWeight;
  const diff = typeof newWeight === 'number' ? newWeight - previousWeight : 0;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await addWeightRecord(cattle.id, formData);
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
          <div>
            <h2 className="text-xl font-bold text-slate-800">إضافة السجل الوزني</h2>
            <p className="text-sm text-slate-500 mt-1">Tag: {cattle.tagNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">الوزن السابق</p>
              <p className="text-xl font-bold text-slate-900">{previousWeight.toFixed(2)} <span className="text-sm font-medium text-slate-500">كجم</span></p>
            </div>
            {typeof newWeight === 'number' && (
              <div className="text-end">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">الزيادة / النقصان</p>
                <div className={`flex items-center justify-end gap-1 font-bold ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                  {diff > 0 ? <TrendingUp className="w-4 h-4" /> : diff < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                  {diff > 0 ? '+' : ''}{diff.toFixed(2)} كجم
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الوزن الجديد (كجم) *</label>
            <input 
              name="weight" 
              type="number" 
              min="0"
              step="0.01"
              required 
              value={newWeight}
              onChange={(e) => setNewWeight(parseFloat(e.target.value) || '')}
              className="w-full px-4 py-2 text-lg font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
              placeholder="اكتب الوزن الجديد..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">التاريخ *</label>
            <input 
              name="date" 
              type="date" 
              required 
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات</label>
            <textarea 
              name="notes" 
              rows={2}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none" 
              placeholder="ملاحظات اختيارية عن هذا الوزن..."
            ></textarea>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition"
            >إلغاء</button>
            <button 
              type="submit" 
              disabled={loading || typeof newWeight !== 'number'}
              className="px-5 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ الوزن'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
