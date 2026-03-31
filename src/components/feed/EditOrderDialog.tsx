'use client';

import { useState } from 'react';
import { updateFeedOrder } from '@/app/actions/feed';
import { X, Calculator } from 'lucide-react';

export default function EditOrderDialog({ isOpen, onClose, order }: { isOpen: boolean; onClose: () => void; order: any }) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(String(order?.quantity || ''));
  const [pricePerUnit, setPricePerUnit] = useState(String(order?.pricePerUnit || ''));

  const totalCost = (parseFloat(quantity) || 0) * (parseFloat(pricePerUnit) || 0);

  if (!isOpen) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateFeedOrder(order.id, formData);
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
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-indigo-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">تعديل طلبية العلف</h2>
            <p className="text-sm text-slate-500 mt-0.5">{order.feedItem?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">نوع العلف</label>
            <input 
              disabled
              value={order.feedItem?.name || ''}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الكمية *</label>
            <div className="flex gap-2">
              <input 
                name="quantity" 
                type="number" 
                min="0.01"
                step="0.01"
                required 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
              />
              <input 
                name="unit"
                defaultValue={order.unit}
                required
                placeholder="الوحدة"
                className="w-28 px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">سعر الوحدة (ج.م) *</label>
            <input 
              name="pricePerUnit" 
              type="number" 
              min="0"
              step="0.01"
              required 
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
            />
          </div>

          {totalCost > 0 && (
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <Calculator className="w-5 h-5 text-indigo-500 shrink-0" />
              <div>
                <p className="text-xs text-indigo-600 font-medium">التكلفة الإجمالية المحسوبة</p>
                <p className="text-lg font-bold text-indigo-700">ج.م {totalCost.toFixed(2)}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">المورد</label>
            <input 
              name="supplier" 
              defaultValue={order.supplier || ''}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الاستلام *</label>
            <input 
              name="orderDate" 
              type="date"
              defaultValue={new Date(order.date || order.orderDate).toISOString().split('T')[0]}
              required 
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition"
            >إلغاء</button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'جاري التحديث...' : 'تحديث الطلبية'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
