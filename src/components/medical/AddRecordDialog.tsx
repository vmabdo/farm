'use client';

import { useState, useMemo } from 'react';
import { createMedicalRecord } from '@/app/actions/medical';
import { X, AlertTriangle, Tag } from 'lucide-react';

export default function AddRecordDialog({
  isOpen,
  onClose,
  cattle,
  medicines,
  orders,
}: {
  isOpen: boolean;
  onClose: () => void;
  cattle: any[];
  medicines: any[];
  orders: any[];
}) {
  const [loading, setLoading] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState('');

  // Derive unit from most-recent PO for the selected medicine
  const derivedUnit = useMemo(() => {
    if (!selectedMedId) return null;
    const medOrders = orders
      .filter((o: any) => o.medicineId === selectedMedId || o.medicine?.id === selectedMedId)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return medOrders.length > 0 ? medOrders[0].unit : null;
  }, [selectedMedId, orders]);

  const hasNoUnit = selectedMedId && derivedUnit === null;

  if (!isOpen) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (hasNoUnit) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    if (derivedUnit) formData.set('unit', derivedUnit);
    const res = await createMedicalRecord(formData);
    setLoading(false);
    if (res.success) {
      setSelectedMedId('');
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
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-rose-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">تسجيل علاج / تحصين</h2>
            <p className="text-sm text-slate-500 mt-0.5">الوحدة تُحدَّد تلقائياً من آخر طلبية</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">

          {/* Cattle selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الحيوان (رقم العلامة) *</label>
            <select
              name="cattleId"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition bg-white"
            >
              <option value="">اختر الحيوان...</option>
              {cattle.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tagNumber} {c.breed?.name ? `(${c.breed.name})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Medicine selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الدواء / التحصين *</label>
            <select
              name="medicineId"
              required
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition bg-white"
            >
              <option value="">اختر الدواء...</option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* No-stock warning */}
          {hasNoUnit && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">
                لا توجد طلبية شراء لهذا الدواء. يجب إضافة طلبية أولاً لتحديد الوحدة.
              </p>
            </div>
          )}

          {/* Treatment type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">نوع العلاج *</label>
            <input
              name="type"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
              placeholder="مثال: تحصين، مضاد حيوي، روتيني"
            />
          </div>

          {/* Dose + auto-unit */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الجرعة المعطاة *</label>
            <div className="flex gap-2 items-center">
              <input
                name="dose"
                type="number"
                min="0.01"
                step="0.01"
                required
                disabled={!derivedUnit}
                placeholder={derivedUnit ? 'أدخل الجرعة...' : 'حدد الدواء أولاً'}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition disabled:bg-slate-50 disabled:text-slate-400"
              />
              {derivedUnit ? (
                <span className="flex items-center gap-1.5 px-3 py-2 bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-sm font-bold whitespace-nowrap">
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
              <p className="text-xs text-rose-600 mt-1 font-medium">
                الوحدة: <strong>{derivedUnit}</strong> (مطابقة لآخر طلبية شراء)
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الإعطاء *</label>
            <input
              name="treatmentDate"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات</label>
            <textarea
              name="notes"
              rows={2}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition resize-none"
              placeholder="أي أعراض لوحظت أو تفاصيل المتابعة..."
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
              disabled={loading || cattle.length === 0 || medicines.length === 0 || !!hasNoUnit || !derivedUnit}
              className="px-5 py-2 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 transition disabled:opacity-50"
            >
              {loading ? 'جاري التسجيل...' : 'تسجيل علاج'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
