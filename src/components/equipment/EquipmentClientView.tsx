'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, Edit2, Search, Wrench } from 'lucide-react';
import { deleteEquipment } from '@/app/actions/equipment';

import AddEquipmentDialog from './AddEquipmentDialog';
import EditEquipmentDialog from './EditEquipmentDialog';

type EquipmentData = any;

export default function EquipmentClientView({ initialEquipment }: { initialEquipment: EquipmentData[] }) {
  const [sortCol, setSortCol] = useState<string>('name');
  const [sortDesc, setSortDesc] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editData, setEditData] = useState<EquipmentData | null>(null);
  const [search, setSearch] = useState('');

  // ==========================
  // Memoized Sorted Data
  // ==========================
  const sortedTransports = useMemo(() => {
    return [...initialEquipment].sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDesc ? 1 : -1;
      if (valA > valB) return sortDesc ? -1 : 1;
      return 0;
    });
  }, [initialEquipment, sortCol, sortDesc]);

  const filteredEquipment = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sortedTransports;
    return sortedTransports.filter((t) =>
      [t.name, t.type, t.status, t.notes]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [sortedTransports, search]);

  // ==========================
  // Handlers
  // ==========================
  const handleSort = (col: string) => {
    if (sortCol === col) setSortDesc(!sortDesc);
    else { setSortCol(col); setSortDesc(true); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المعدة؟')) {
      const res = await deleteEquipment(id);
      if (!res.success) alert(res.error);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
        {/* Search bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث عن معدة..."
            className="w-full ps-9 pe-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
          />
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />إضافة معدة</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm whitespace-nowrap">
            <thead className="bg-emerald-50/50 border-b border-emerald-100 text-slate-600 font-medium">
              <tr>
                {[
                  { label: 'الاسم', key: 'name' },
                  { label: 'النوع', key: 'type' },
                  { label: 'الحالة', key: 'status' },
                  { label: 'ملاحظات', key: 'notes' }
                ].map((col) => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="px-6 py-4 cursor-pointer hover:bg-emerald-100/50 transition select-none">
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortCol === col.key && (sortDesc ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronUp className="w-4 h-4 text-emerald-500" />)}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-end">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredEquipment.map((eq: EquipmentData) => (
                <tr key={eq.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2"><Wrench className="w-4 h-4 text-slate-400"/> {eq.name}</td>
                  <td className="px-6 py-4 text-slate-600">{eq.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      eq.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      eq.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {eq.status === 'ACTIVE' ? 'نشط' : eq.status === 'MAINTENANCE' ? 'صيانة' : 'خارج الخدمة'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">{eq.notes || '-'}</td>
                  <td className="px-6 py-4 text-end flex flex-nowrap items-center justify-end gap-2">
                    <button onClick={() => setEditData(eq)} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(eq.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filteredEquipment.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">لا توجد معدات مضافة.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEquipmentDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      {editData && <EditEquipmentDialog isOpen={!!editData} onClose={() => setEditData(null)} equipment={editData} />}
    </>
  );
}
