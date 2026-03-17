'use client';

import { useState } from 'react';
import { updateMedicalRecord } from '@/app/actions/medical';
import { X } from 'lucide-react';

export default function EditRecordDialog({ isOpen, onClose, record, cattle, medicines }: { isOpen: boolean; onClose: () => void; record: any; cattle: any[]; medicines: any[] }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Edit Treatment Log</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cattle (Tag Number) *</label>
            <select
              name="cattleId"
              required
              defaultValue={record.cattleId}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition bg-white"
            >
              {cattle.map(c => (
                <option key={c.id} value={c.id}>{c.tagNumber} ({c.breed})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Medicine/Vaccine *</label>
            <select
              name="medicineId"
              required
              defaultValue={record.medicineId}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition bg-white"
            >
              {medicines.map(m => (
                <option key={m.id} value={m.id}>{m.name} (Unit: {m.unit})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Treatment Type *</label>
            <input 
              name="type" 
              required 
              defaultValue={record.type}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dose Given *</label>
            <input 
              name="dose" 
              type="number" 
              step="0.01"
              required 
              defaultValue={record.dose}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date Administered *</label>
            <input 
              name="treatmentDate" 
              type="date"
              defaultValue={new Date(record.treatmentDate).toISOString().split('T')[0]}
              required 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea 
              name="notes"
              rows={2} 
              defaultValue={record.notes || ''}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition resize-none" 
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
              {loading ? 'Updating...' : 'Update Treatment Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
