'use client';

import { useState } from 'react';
import { deleteEquipmentMaintenance } from '@/app/actions/equipment';
import { X, Plus, Trash2, Wrench } from 'lucide-react';
import AddMaintenanceDialog from './AddMaintenanceDialog';

export default function MaintenanceLogModal({ isOpen, onClose, equipment }: { isOpen: boolean; onClose: () => void; equipment: any }) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  if (!isOpen || !equipment) return null;

  const maintenanceLogs = equipment.maintenances || [];
  const totalCost = maintenanceLogs.reduce((sum: number, m: any) => sum + (m.cost || 0), 0);

  const handleDelete = async (id: string) => {
    if (confirm('هل تريد حذف هذا السجل؟')) {
      const res = await deleteEquipmentMaintenance(id);
      if (!res.success) alert(res.error);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-amber-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">سجل الصيانة</h2>
                <p className="text-sm text-slate-500">{equipment.name} — إجمالي التكاليف: <span className="font-bold text-amber-600">ج.م {totalCost.toFixed(2)}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 transition"
              >
                <Plus className="w-4 h-4" /> صيانة جديدة
              </button>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-88px)]">
            {maintenanceLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Wrench className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-lg font-medium">لا توجد سجلات صيانة</p>
                <p className="text-sm mt-1">اضغط &quot;صيانة جديدة&quot; لإضافة أول سجل</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4 text-start">التاريخ</th>
                    <th className="px-6 py-4 text-start">الوصف</th>
                    <th className="px-6 py-4 text-start">التكلفة</th>
                    <th className="px-6 py-4 text-end">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {maintenanceLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-amber-50/30 transition">
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {new Date(log.date).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-6 py-4 text-slate-800">{log.description}</td>
                      <td className="px-6 py-4 font-bold text-amber-600">
                        {log.cost > 0 ? `ج.م ${log.cost.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-end">
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <AddMaintenanceDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} equipment={equipment} />
    </>
  );
}
