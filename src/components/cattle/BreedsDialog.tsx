'use client';

import { useState } from 'react';
import { createBreed, updateBreed, deleteBreed } from '@/app/actions/breeds';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';

export default function BreedsDialog({ isOpen, onClose, breeds }: { isOpen: boolean; onClose: () => void; breeds: any[] }) {
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  if (!isOpen) return null;

  async function onSubmitAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createBreed(formData);
    setLoading(false);
    if (!res.success) alert(res.error);
    else (e.target as HTMLFormElement).reset();
  }

  async function onSubmitEdit(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateBreed(id, formData);
    setLoading(false);
    if (!res.success) alert(res.error);
    else setEditId(null);
  }

  async function handleDelete(id: string) {
    if (confirm('هل أنت متأكد من حذف هذه السلالة؟')) {
      const res = await deleteBreed(id);
      if (!res.success) alert(res.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative flex flex-col" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800">إدارة السلالات</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Add Breed Form */}
          <form onSubmit={onSubmitAdd} className="flex gap-2 items-end bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-emerald-800 mb-1">اسم السلالة *</label>
              <input name="name" required className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="مثال: هولشتاين" />
            </div>
            <div className="w-32">
              <label className="block text-xs font-semibold text-emerald-800 mb-1">السعر (ج.م/كجم) *</label>
              <input name="pricePerKg" type="number" min="0" step="0.01" required className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="0.00" />
            </div>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 h-[38px] flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* List Breeds */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-700 text-sm mb-3">السلالات المتاحة ({breeds.length})</h3>
            {breeds.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">لا توجد سلالات مضافة بعد.</p>
            ) : (
              breeds.map(breed => (
                <div key={breed.id} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-50 transition">
                  {editId === breed.id ? (
                    <form onSubmit={(e) => onSubmitEdit(e, breed.id)} className="flex items-center gap-2 flex-1">
                      <input name="name" defaultValue={breed.name} required className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500" />
                      <input name="pricePerKg" type="number" min="0" step="0.01" defaultValue={breed.pricePerKg} required className="w-24 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500" />
                      <button type="submit" disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">حفظ</button>
                      <button type="button" onClick={() => setEditId(null)} className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300">إلغاء</button>
                    </form>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{breed.name}</span>
                        <span className="text-sm text-emerald-600 font-medium">{breed.pricePerKg.toFixed(2)} ج.م / كجم</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditId(breed.id)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(breed.id)} className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition">إغلاق</button>
        </div>
      </div>
    </div>
  );
}
