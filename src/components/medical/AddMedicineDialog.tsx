'use client';

import { useState } from 'react';
import { createMedicine } from '@/app/actions/medical';
import { X } from 'lucide-react';

export default function AddMedicineDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createMedicine(formData);
    setLoading(false);
    
    if (res.success) {
      onClose();
    } else {
      alert(res.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Add Medicine/Vaccine</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name *</label>
            <input 
              name="name" 
              required 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition" 
              placeholder="e.g. Penicillin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
            <input 
              name="supplier" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition" 
              placeholder="e.g. Vet Solutions Inc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock Amount *</label>
            <input 
              name="currentStock" 
              type="number" 
              step="0.01"
              required 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Unit of Measurement *</label>
            <select
              name="unit"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition bg-white"
            >
              <option value="ML">Milliliters (ML)</option>
              <option value="MG">Milligrams (MG)</option>
              <option value="DOSES">Doses</option>
              <option value="BOTTLES">Bottles</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Expiration Date</label>
            <input 
              name="expirationDate" 
              type="date" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition" 
            />
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
