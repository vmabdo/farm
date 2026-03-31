'use client';

import { useState } from 'react';
import { createMedicalPurchaseOrder } from '@/app/actions/medical';
import { X, Calculator } from 'lucide-react';

export default function AddPurchaseOrderDialog({ isOpen, onClose, medicines }: { isOpen: boolean; onClose: () => void; medicines: any[] }) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [unitMode, setUnitMode] = useState<'select' | 'text'>('select');
  const [unitText, setUnitText] = useState('');

  const totalCost = (parseFloat(quantity) || 0) * (parseFloat(pricePerUnit) || 0);

  if (!isOpen) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    if (unitMode === 'text') {
      formData.set('unit', unitText);
    }
    const res = await createMedicalPurchaseOrder(formData);
    setLoading(false);
    
    if (res.success) {
      setQuantity('');
      setPricePerUnit('');
      setUnitText('');
      onClose();
    } else {
      alert(res.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full animate-in fade-in zoom-in-95 duration-300 max-w-md overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-rose-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">تسجيل طلبية أدوية</h2>
            <p className="text-sm text-slate-500 mt-0.5">إضافة طلبية شراء جديدة للمخزون</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">اسم الدواء *</label>
            <select
              name="medicineId"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition bg-white"
            >
              <option value="">حدد الدواء...</option>
              {medicines.map(med => (
                <option key={med.id} value={med.id}>{med.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الكمية والوحدة *</label>
            <div className="flex gap-2">
              <input 
                name="quantity" 
                type="number" 
                min="0.01"
                step="0.01"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition" 
              />
              {unitMode === 'select' ? (
                <div className="flex gap-1">
                  <select
                    name="unit"
                    required
                    className="w-28 px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition bg-white text-sm"
                  >
                    <option value="مللي">مللي</option>
                    <option value="جرعة">جرعة</option>
                    <option value="عبوة">عبوة</option>
                    <option value="كيلو">كيلو</option>
                    <option value="لتر">لتر</option>
                  </select>
                  <button type="button" onClick={() => setUnitMode('text')} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition whitespace-nowrap">أخرى</button>
                </div>
              ) : (
                <div className="flex gap-1">
                  <input
                    name="unit"
                    required
                    value={unitText}
                    onChange={(e) => setUnitText(e.target.value)}
                    placeholder="وحدة..."
                    className="w-24 px-3 py-2 border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition text-sm"
                  />
                  <button type="button" onClick={() => { setUnitMode('select'); setUnitText(''); }} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition whitespace-nowrap">←</button>
                </div>
              )}
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
              placeholder="0.00"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition" 
            />
          </div>

          {/* Auto-calculated total */}
          {totalCost > 0 && (
            <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl border border-rose-100">
              <Calculator className="w-5 h-5 text-rose-500 shrink-0" />
              <div>
                <p className="text-xs text-rose-600 font-medium">التكلفة الإجمالية المحسوبة</p>
                <p className="text-lg font-bold text-rose-700">ج.م {totalCost.toFixed(2)}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الاستلام *</label>
            <input 
              name="date" 
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required 
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition" 
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
              disabled={loading || medicines.length === 0}
              className="px-5 py-2 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 transition disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'تسجيل الطلبية'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
