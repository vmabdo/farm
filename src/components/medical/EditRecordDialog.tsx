'use client';

import { useState } from 'react';
import { updateMedicalRecord } from '@/app/actions/medical';
import { X, Tag } from 'lucide-react';

export default function EditRecordDialog({
  isOpen,
  onClose,
  record,
  cattle,
  medicines,
}: {
  isOpen: boolean;
  onClose: () => void;
  record: any;
  cattle: any[];
  medicines: any[];
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Unit is fixed to the one originally recorded
  const unit = record.unit || '';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    // Always preserve the original unit — no user override
    formData.set('unit', unit);
    const res = await updateMedicalRecord(record.id, formData);
    setLoading(false);
    if (res.success) {
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
            <h2 className="text-xl font-bold text-slate-800">تعديل سجل العلاج</h2>
            <p className="text-sm text-slate-500 mt-0.5">{record.medicine?.name || record.cattle?.tagNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">

          {/* Cattle */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الحيوان (رقم العلامة) *</label>
            <select
              name="cattleId"
              required
              defaultValue={record.cattleId}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition bg-white"
            >
              {cattle.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tagNumber} {c.breed?.name ? `(${c.breed.name})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Medicine (read-only — changing medicine would invalidate unit) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الدواء / التحصين</label>
            <input
              disabled
              value={record.medicine?.name || ''}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <input type="hidden" name="medicineId" value={record.medicineId} />
          </div>

          {/* Treatment type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">نوع العلاج *</label>
            <input
              name="type"
              required
              defaultValue={record.type}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
            />
          </div>

          {/* Dose + read-only unit */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الجرعة المعطاة *</label>
            <div className="flex gap-2 items-center">
              <input
                name="dose"
                type="number"
                min="0.01"
                step="0.01"
                required
                defaultValue={record.dose}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
              />
              <span className="flex items-center gap-1.5 px-3 py-2 bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-sm font-bold whitespace-nowrap">
                <Tag className="w-3.5 h-3.5" />
                {unit || '—'}
              </span>
            </div>
            <p className="text-xs text-rose-600 mt-1 font-medium">الوحدة ثابتة ومطابقة لطلبية الشراء</p>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الإعطاء *</label>
            <input
              name="treatmentDate"
              type="date"
              defaultValue={new Date(record.treatmentDate).toISOString().split('T')[0]}
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
              defaultValue={record.notes || ''}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition resize-none"
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
              className="px-5 py-2 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 transition disabled:opacity-50"
            >
              {loading ? 'جاري التحديث...' : 'تحديث سجل العلاج'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
