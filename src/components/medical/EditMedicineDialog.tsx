'use client';

import { useState } from 'react';
import { updateMedicine } from '@/app/actions/medical';
import { X } from 'lucide-react';

export default function EditMedicineDialog({ isOpen, onClose, medicine }: { isOpen: boolean; onClose: () => void; medicine: any }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateMedicine(medicine.id, formData);
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
          <h2 className="text-xl font-bold text-slate-800">تعديل الدواء / التحصين</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">اسم الدواء *</label>
            <input 
              name="name" 
              required 
              defaultValue={medicine.name}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الشركة المصنعة / المورد</label>
            <input 
              name="supplier" 
              defaultValue={medicine.supplier || ''}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">المخزون الحالي *</label>
            <input 
              name="currentStock" 
              type="number" 
              min="0"
              step="0.01"
              required 
              defaultValue={medicine.currentStock}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الوحدة المرجعية *</label>
            <select
              name="unit"
              required
              defaultValue={medicine.unit}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition bg-white"
            >
              <option value="ML">مل (ML)</option>
              <option value="MG">جرام / ملجم (MG)</option>
              <option value="DOSES">جرعات</option>
              <option value="BOTTLES">زجاجات</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الصلاحية</label>
            <input 
              name="expirationDate" 
              type="date" 
              defaultValue={medicine.expirationDate ? new Date(medicine.expirationDate).toISOString().split('T')[0] : ''}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition" 
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
              className="px-5 py-2 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 transition disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'تحديث الدواء'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
