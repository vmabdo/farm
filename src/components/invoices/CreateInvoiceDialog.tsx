'use client';

import { useState } from 'react';
import { createInvoice } from '@/app/actions/invoices';
import { X, Plus, Trash2 } from 'lucide-react';

export default function CreateInvoiceDialog({ isOpen, onClose, cattle = [] }: { isOpen: boolean; onClose: () => void; cattle?: any[] }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([{ name: '', quantity: 1, price: 0 }]);
  const [discount, setDiscount] = useState(0);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + Number(item.price), 0);
  const netAmount = Math.max(0, subtotal - discount);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return alert('Please add at least one item.');
    if (items.some(i => !i.name || i.quantity <= 0 || i.price < 0)) return alert('Please ensure all items are filled correctly.');

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('items', JSON.stringify(items));
    
    const res = await createInvoice(formData);
    setLoading(false);
    
    if (res.success) {
      setItems([{ name: '', quantity: 1, price: 0 }]); // reset
      setDiscount(0);
      onClose();
    } else {
      alert(res.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800">إنشاء فاتورة</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="create-invoice-form" onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم العميل *</label>
                <input 
                  name="clientName" 
                  required 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
                  placeholder="مثال: مزارع الجزيرة"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الفاتورة *</label>
                <input 
                  name="invoiceDate" 
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">عناصر الفاتورة</h3>
                <button type="button" onClick={handleAddItem} className="text-sm font-medium text-blue-600 flex items-center gap-1 hover:text-blue-800">
                  <Plus className="w-4 h-4" />إضافة عنصر</button>
              </div>
              <div className="p-4 space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="flex-1 relative">
                      <input 
                        type="text"
                        list="cattle-list"
                        placeholder="ابحث برقم البطاقة (التاج)..."
                        value={item.name} 
                        onChange={(e) => {
                          const tag = e.target.value;
                          const calf = cattle?.find(c => c.tagNumber === tag);
                          const newItems = [...items];
                          newItems[idx].name = tag;
                          if (calf) {
                            const pricePerKg = calf.breed?.pricePerKg || 0;
                            const weight = calf.currentWeight || calf.entryWeight || 0;
                            newItems[idx].quantity = weight;
                            newItems[idx].price = parseFloat((pricePerKg * weight).toFixed(2));
                          }
                          setItems(newItems);
                        }} 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 bg-white" 
                        required
                      />
                      <datalist id="cattle-list">
                        {cattle?.map(c => (
                          <option key={c.id} value={c.tagNumber}>
                            عجل {c.tagNumber} {c.breed?.name ? `(${c.breed.name})` : ''} - {(c.currentWeight || c.entryWeight).toFixed(2)} كجم
                          </option>
                        ))}
                      </datalist>
                    </div>
                    <div className="w-24">
                      <input 
                        type="number" 
                        min="0.1" 
                        step="0.01"
                        placeholder="الكمية" 
                        value={item.quantity} 
                        readOnly
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none focus:ring-0" 
                        required
                      />
                    </div>
                    <div className="w-32">
                      <input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="السعر" 
                        value={item.price} 
                        readOnly
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none focus:ring-0" 
                        required
                      />
                    </div>
                    <button type="button" onClick={() => handleRemoveItem(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded mt-0.5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات / شروط</label>
                <textarea 
                  name="notes"
                  rows={2} 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none text-sm" 
                  placeholder="شكراً لتعاملكم معنا..."
                />
              </div>
              <div className="w-full md:w-64 space-y-3">
                <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                  <span>المجموع الفرعي</span>
                  <span>ج.م {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-600">الخصم بالجنيه</span>
                  <input 
                    name="discount" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={discount} 
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} 
                    className="w-24 px-2 py-1 text-right border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 transition" 
                  />
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-lg font-bold text-slate-800">
                  <span>الإجمالي المستحق</span>
                  <span className="text-blue-600">ج.م {netAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition"
          >إلغاء</button>
          <button 
            type="submit" 
            form="create-invoice-form"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'جاري الإنشاء...' : 'حفظ وإنشاء الفاتورة'}
          </button>
        </div>
      </div>
    </div>
  );
}
