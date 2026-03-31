'use client';

import { useState, useMemo } from 'react';
import { createFeedConsumption } from '@/app/actions/feed';
import { X, AlertTriangle, Tag } from 'lucide-react';

export default function AddConsumptionDialog({
  isOpen,
  onClose,
  items,
  orders,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  orders: any[];
}) {
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');

  // Derive the unit from the most-recent PO for the selected item
  const derivedUnit = useMemo(() => {
    if (!selectedItemId) return null;
    const itemOrders = orders
      .filter((o: any) => o.feedId === selectedItemId || o.feedItem?.id === selectedItemId)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return itemOrders.length > 0 ? itemOrders[0].unit : null;
  }, [selectedItemId, orders]);

  const hasNoUnit = selectedItemId && derivedUnit === null;

  if (!isOpen) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (hasNoUnit) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    // Inject the server-side-matched unit — server will re-validate
    if (derivedUnit) formData.set('unit', derivedUnit);
    const res = await createFeedConsumption(formData);
    setLoading(false);
    if (res.success) {
      setSelectedItemId('');
      onClose();
    } else {
      alert(res.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full animate-in fade-in zoom-in-95 duration-300 max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-amber-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">تسجيل استهلاك العلف</h2>
            <p className="text-sm text-slate-500 mt-0.5">الوحدة تُحدَّد تلقائياً من آخر طلبية</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Feed item selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">نوع العلف *</label>
            <select
              name="feedItemId"
              required
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition bg-white"
            >
              <option value="">حدد نوع العلف...</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          {/* No-stock warning */}
          {hasNoUnit && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">
                لا توجد طلبية شراء لهذا العلف. يجب إضافة طلبية أولاً لتحديد الوحدة.
              </p>
            </div>
          )}

          {/* Quantity + auto-unit */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الكمية المستهلكة *</label>
            <div className="flex gap-2 items-center">
              <input
                name="quantity"
                type="number"
                min="0.01"
                step="0.01"
                required
                disabled={!derivedUnit}
                placeholder={derivedUnit ? 'أدخل الكمية...' : 'حدد العلف أولاً'}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:bg-slate-50 disabled:text-slate-400"
              />
              {/* Read-only unit badge */}
              {derivedUnit ? (
                <span className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-sm font-bold whitespace-nowrap">
                  <Tag className="w-3.5 h-3.5" />
                  {derivedUnit}
                </span>
              ) : (
                <span className="px-3 py-2 bg-slate-100 text-slate-400 rounded-xl text-sm whitespace-nowrap border border-slate-200">
                  الوحدة
                </span>
              )}
            </div>
            {derivedUnit && (
              <p className="text-xs text-amber-600 mt-1 font-medium">
                الوحدة: <strong>{derivedUnit}</strong> (مطابقة لآخر طلبية شراء)
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الاستهلاك *</label>
            <input
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات</label>
            <textarea
              name="notes"
              rows={2}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition resize-none"
              placeholder="أضف أي تفاصيل أخرى..."
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
              disabled={loading || items.length === 0 || !!hasNoUnit || !derivedUnit}
              className="px-5 py-2 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition disabled:opacity-50"
            >
              {loading ? 'جاري المعالجة...' : 'سجل الاستهلاك'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
