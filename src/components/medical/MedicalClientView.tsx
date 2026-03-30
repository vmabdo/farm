'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, Edit2, Syringe, HeartPulse, Search } from 'lucide-react';
import { deleteMedicine, deleteMedicalRecord } from '@/app/actions/medical';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

import AddMedicineDialog from './AddMedicineDialog';
import EditMedicineDialog from './EditMedicineDialog';
import AddRecordDialog from './AddRecordDialog';
import EditRecordDialog from './EditRecordDialog';

type MedicineData = any;
type MedicalRecordData = any;
type CattleData = any;

export default function MedicalClientView({ 
  initialMedicines, 
  initialRecords,
  cattleData
}: { 
  initialMedicines: MedicineData[], 
  initialRecords: MedicalRecordData[],
  cattleData: CattleData[]
}) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'records'>('inventory');

  // Medicine State
  const [medSortCol, setMedSortCol] = useState<string>('name');
  const [medSortDesc, setMedSortDesc] = useState<boolean>(false);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [editMedData, setEditMedData] = useState<MedicineData | null>(null);

  // Treatment Records State
  const [recSortCol, setRecSortCol] = useState<string>('treatmentDate');
  const [recSortDesc, setRecSortDesc] = useState<boolean>(true);
  const [isAddRecOpen, setIsAddRecOpen] = useState(false);
  const [editRecData, setEditRecData] = useState<MedicalRecordData | null>(null);
  const [search, setSearch] = useState('');

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean; title: string; message: string;
    confirmText: string; variant: 'danger' | 'warning' | 'primary'; onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', confirmText: 'تأكيد', variant: 'danger', onConfirm: () => {} });
  const openConfirm = (opts: Omit<typeof confirmState, 'isOpen'>) => setConfirmState({ isOpen: true, ...opts });
  const closeConfirm = () => setConfirmState((s) => ({ ...s, isOpen: false }));

  // ==========================
  // Memoized Sorted Data
  // ==========================
  const sortedMedicines = useMemo(() => {
    return [...initialMedicines].sort((a, b) => {
      let valA = a[medSortCol];
      let valB = b[medSortCol];
      
      if (medSortCol === 'expirationDate' && valA) valA = new Date(valA).getTime();
      if (medSortCol === 'expirationDate' && valB) valB = new Date(valB).getTime();

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      // Handle nulls
      if (valA === null) return 1;
      if (valB === null) return -1;

      if (valA < valB) return medSortDesc ? 1 : -1;
      if (valA > valB) return medSortDesc ? -1 : 1;
      return 0;
    });
  }, [initialMedicines, medSortCol, medSortDesc]);

  const sortedRecords = useMemo(() => {
    return [...initialRecords].sort((a, b) => {
      let valA = a[recSortCol];
      let valB = b[recSortCol];
      
      if (recSortCol === 'cattle') {
        valA = a.cattle?.tagNumber;
        valB = b.cattle?.tagNumber;
      } else if (recSortCol === 'medicine') {
        valA = a.medicine?.name;
        valB = b.medicine?.name;
      } else if (recSortCol === 'treatmentDate') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return recSortDesc ? 1 : -1;
      if (valA > valB) return recSortDesc ? -1 : 1;
      return 0;
    });
  }, [initialRecords, recSortCol, recSortDesc]);

  const filteredMedicines = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sortedMedicines;
    return sortedMedicines.filter((m) =>
      [m.name, m.supplier, m.unit]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [sortedMedicines, search]);

  const filteredRecords = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sortedRecords;
    return sortedRecords.filter((r) =>
      [r.cattle?.tagNumber, r.medicine?.name, r.type, r.notes]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [sortedRecords, search]);

  // ==========================
  // Handlers
  // ==========================
  const handleSortMeds = (col: string) => {
    if (medSortCol === col) setMedSortDesc(!medSortDesc);
    else { setMedSortCol(col); setMedSortDesc(true); }
  };
  const handleSortRecs = (col: string) => {
    if (recSortCol === col) setRecSortDesc(!recSortDesc);
    else { setRecSortCol(col); setRecSortDesc(true); }
  };

  const handleDeleteMedicine = async (id: string) => {
    openConfirm({
      title: 'حذف الدواء',
      message: 'هل أنت متأكد من حذف هذا الدواء؟ سيتم حذف جميع العلاجات المرتبطة به بشكل دائم.',
      confirmText: 'حذف الدواء',
      variant: 'danger',
      onConfirm: async () => { const res = await deleteMedicine(id); if (!res.success) alert(res.error); },
    });
  };

  const handleDeleteRecord = async (id: string) => {
    openConfirm({
      title: 'حذف السجل العلاجي',
      message: 'هل أنت متأكد من حذف هذا السجل العلاجي؟ سيتم إرجاع الجرعة إلى المخزون.',
      confirmText: 'حذف السجل',
      variant: 'warning',
      onConfirm: async () => { const res = await deleteMedicalRecord(id); if (!res.success) alert(res.error); },
    });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex bg-slate-200/50 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            مخزون الأدوية
          </button>
          <button 
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'records' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            سجل العلاجات
          </button>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث بالأسم أو المورد أو الوحدة..."
            className="w-full ps-9 pe-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
          />
        </div>

        <div>
          {activeTab === 'inventory' && (
            <button
              onClick={() => setIsAddMedOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
            >
              <Plus className="w-5 h-5" />إضافة دواء</button>
          )}
          {activeTab === 'records' && (
            <button
              onClick={() => setIsAddRecOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition"
            >
              <HeartPulse className="w-5 h-5" />تسجيل علاج</button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm whitespace-nowrap">
            
            {/* INVENTORY TABLE HEADER */}
            {activeTab === 'inventory' && (
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  {[
                    { label: 'اسم الدواء', key: 'name' },
                    { label: 'المورد / الشركة', key: 'supplier' },
                    { label: 'المخزون الحالي', key: 'currentStock' },
                    { label: 'الوحدة', key: 'unit' },
                    { label: 'تاريخ الصلاحية', key: 'expirationDate' },
                  ].map((col) => (
                    <th key={col.key} onClick={() => handleSortMeds(col.key)} className="px-8 py-5 cursor-pointer hover:bg-slate-100 transition select-none">
                      <div className="flex items-center gap-1">
                        {col.label}
                        {medSortCol === col.key && (medSortDesc ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronUp className="w-4 h-4 text-emerald-500" />)}
                      </div>
                    </th>
                  ))}
                  <th className="px-8 py-5 text-end">الإجراءات</th>
                </tr>
              </thead>
            )}

            {/* RECORDS TABLE HEADER */}
            {activeTab === 'records' && (
              <thead className="bg-rose-50/50 border-b border-rose-100 text-slate-600 font-medium">
                <tr>
                  {[
                    { label: 'التاريخ', key: 'treatmentDate' },
                    { label: 'رقم الحيوان', key: 'cattle' },
                    { label: 'اسم الدواء', key: 'medicine' },
                    { label: 'النوع', key: 'type' },
                    { label: 'الجرعة المعطاة', key: 'dose' },
                    { label: 'ملاحظات', key: 'notes' }
                  ].map((col) => (
                    <th key={col.key} onClick={() => handleSortRecs(col.key)} className="px-8 py-5 cursor-pointer hover:bg-rose-100/50 transition select-none">
                      <div className="flex items-center gap-1">
                        {col.label}
                        {recSortCol === col.key && (recSortDesc ? <ChevronDown className="w-4 h-4 text-rose-500" /> : <ChevronUp className="w-4 h-4 text-rose-500" />)}
                      </div>
                    </th>
                  ))}
                  <th className="px-8 py-5 text-end">الإجراءات</th>
                </tr>
              </thead>
            )}

            <tbody className="divide-y divide-slate-100">
              
              {/* INVENTORY ROWS */}
              {activeTab === 'inventory' && filteredMedicines.map((med: MedicineData) => (
                <tr key={med.id} className="hover:bg-slate-50 transition">
                  <td className="px-8 py-5 font-semibold text-slate-900 flex items-center gap-2"><Syringe className="w-4 h-4 text-slate-400"/> {med.name}</td>
                  <td className="px-8 py-5 text-slate-600">{med.supplier || '-'}</td>
                  <td className="px-8 py-5 font-bold text-emerald-600">{med.currentStock.toFixed(2)}</td>
                  <td className="px-8 py-5 text-slate-500">{med.unit}</td>
                  <td className="px-8 py-5 text-slate-600">
                    {med.expirationDate ? new Date(med.expirationDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-8 py-5 text-end">
                    <button onClick={() => setEditMedData(med)} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-xl transition me-1"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteMedicine(med.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'inventory' && filteredMedicines.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">لا يوجد مخزون أدوية.</td></tr>
              )}

              {/* RECORD ROWS */}
              {activeTab === 'records' && filteredRecords.map((rec: MedicalRecordData) => (
                <tr key={rec.id} className="hover:bg-rose-50/20 transition">
                  <td className="px-8 py-5 text-slate-600">{new Date(rec.treatmentDate).toLocaleDateString()}</td>
                  <td className="px-8 py-5 font-medium text-slate-900">{rec.cattle.tagNumber}</td>
                  <td className="px-8 py-5 font-medium text-indigo-700">{rec.medicine.name}</td>
                  <td className="px-8 py-5 text-slate-700">{rec.type}</td>
                  <td className="px-8 py-5 font-bold text-rose-600">{rec.dose.toFixed(2)} {rec.medicine.unit}</td>
                  <td className="px-8 py-5 text-slate-500 truncate max-w-xs">{rec.notes || '-'}</td>
                  <td className="px-8 py-5 text-end">
                    <button onClick={() => setEditRecData(rec)} className="p-1.5 text-slate-600 hover:bg-rose-100 rounded-xl transition me-1"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteRecord(rec.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'records' && filteredRecords.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">لا توجد سجلات علاج.</td></tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddMedicineDialog isOpen={isAddMedOpen} onClose={() => setIsAddMedOpen(false)} />
      {editMedData && <EditMedicineDialog isOpen={!!editMedData} onClose={() => setEditMedData(null)} medicine={editMedData} />}
      
      <AddRecordDialog isOpen={isAddRecOpen} onClose={() => setIsAddRecOpen(false)} cattle={cattleData} medicines={initialMedicines} />
      {editRecData && <EditRecordDialog isOpen={!!editRecData} onClose={() => setEditRecData(null)} record={editRecData} cattle={cattleData} medicines={initialMedicines} />}
      <ConfirmDialog
        isOpen={confirmState.isOpen} onClose={closeConfirm} onConfirm={confirmState.onConfirm}
        title={confirmState.title} message={confirmState.message}
        confirmText={confirmState.confirmText} variant={confirmState.variant}
      />
    </>
  );
}
