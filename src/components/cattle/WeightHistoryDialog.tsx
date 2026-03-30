'use client';

import { X } from 'lucide-react';

export default function WeightHistoryDialog({ isOpen, onClose, cattle }: { isOpen: boolean; onClose: () => void; cattle: any }) {
  if (!isOpen || !cattle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full animate-in fade-in zoom-in-95 duration-300 max-w-2xl overflow-hidden relative flex flex-col" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">سجل الأوزان</h2>
            <p className="text-sm text-slate-500 mt-1">رقم البطاقة: {cattle.tagNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {cattle.weights && cattle.weights.length > 0 ? (
            <table className="w-full text-start text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-8 py-5">التاريخ</th>
                  <th className="px-8 py-5">الوزن (كجم)</th>
                  <th className="px-8 py-5">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cattle.weights.map((w: any, index: number) => {
                  const isLatest = index === 0;
                  return (
                    <tr key={w.id} className="hover:bg-slate-50 transition">
                      <td className="px-8 py-5 text-slate-600">
                        {new Date(w.date).toLocaleDateString()}
                      </td>
                      <td className={`px-8 py-5 font-bold ${isLatest ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {w.weight.toFixed(2)}
                      </td>
                      <td className="px-8 py-5 text-slate-500 max-w-[200px] truncate">{w.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-slate-500 py-8">لا يوجد سجل أوزان لهذا العجل.</p>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition">إغلاق</button>
        </div>
      </div>
    </div>
  );
}
