'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, Edit2, Syringe, HeartPulse } from 'lucide-react';
import { deleteMedicine, deleteMedicalRecord } from '@/app/actions/medical';

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
    if (confirm('Delete this medicine? This will permanently delete all associated medical treatment logs.')) {
      const res = await deleteMedicine(id);
      if (!res.success) alert(res.error);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (confirm('Delete this treatment record? (The dose will be added back to the inventory).')) {
      const res = await deleteMedicalRecord(id);
      if (!res.success) alert(res.error);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex bg-slate-200/50 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            Medicine Inventory
          </button>
          <button 
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'records' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            Treatment Logs
          </button>
        </div>

        <div>
          {activeTab === 'inventory' && (
            <button
              onClick={() => setIsAddMedOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <Plus className="w-5 h-5" /> Add Medicine
            </button>
          )}
          {activeTab === 'records' && (
            <button
              onClick={() => setIsAddRecOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
            >
              <HeartPulse className="w-5 h-5" /> Log Treatment
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm whitespace-nowrap">
            
            {/* INVENTORY TABLE HEADER */}
            {activeTab === 'inventory' && (
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  {[
                    { label: 'Medicine Name', key: 'name' },
                    { label: 'Supplier', key: 'supplier' },
                    { label: 'Current Stock', key: 'currentStock' },
                    { label: 'Unit', key: 'unit' },
                    { label: 'Expiration', key: 'expirationDate' },
                  ].map((col) => (
                    <th key={col.key} onClick={() => handleSortMeds(col.key)} className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none">
                      <div className="flex items-center gap-1">
                        {col.label}
                        {medSortCol === col.key && (medSortDesc ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronUp className="w-4 h-4 text-emerald-500" />)}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-end">Actions</th>
                </tr>
              </thead>
            )}

            {/* RECORDS TABLE HEADER */}
            {activeTab === 'records' && (
              <thead className="bg-rose-50/50 border-b border-rose-100 text-slate-600 font-medium">
                <tr>
                  {[
                    { label: 'Date', key: 'treatmentDate' },
                    { label: 'Cattle Tag', key: 'cattle' },
                    { label: 'Medicine', key: 'medicine' },
                    { label: 'Type', key: 'type' },
                    { label: 'Dose Given', key: 'dose' },
                    { label: 'Notes', key: 'notes' }
                  ].map((col) => (
                    <th key={col.key} onClick={() => handleSortRecs(col.key)} className="px-6 py-4 cursor-pointer hover:bg-rose-100/50 transition select-none">
                      <div className="flex items-center gap-1">
                        {col.label}
                        {recSortCol === col.key && (recSortDesc ? <ChevronDown className="w-4 h-4 text-rose-500" /> : <ChevronUp className="w-4 h-4 text-rose-500" />)}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-end">Actions</th>
                </tr>
              </thead>
            )}

            <tbody className="divide-y divide-slate-100">
              
              {/* INVENTORY ROWS */}
              {activeTab === 'inventory' && sortedMedicines.map((med: MedicineData) => (
                <tr key={med.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2"><Syringe className="w-4 h-4 text-slate-400"/> {med.name}</td>
                  <td className="px-6 py-4 text-slate-600">{med.supplier || '-'}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{med.currentStock.toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-500">{med.unit}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {med.expirationDate ? new Date(med.expirationDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-end">
                    <button onClick={() => setEditMedData(med)} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition me-1"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteMedicine(med.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'inventory' && sortedMedicines.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No medical inventory found.</td></tr>
              )}

              {/* RECORD ROWS */}
              {activeTab === 'records' && sortedRecords.map((rec: MedicalRecordData) => (
                <tr key={rec.id} className="hover:bg-rose-50/20 transition">
                  <td className="px-6 py-4 text-slate-600">{new Date(rec.treatmentDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{rec.cattle.tagNumber}</td>
                  <td className="px-6 py-4 font-medium text-indigo-700">{rec.medicine.name}</td>
                  <td className="px-6 py-4 text-slate-700">{rec.type}</td>
                  <td className="px-6 py-4 font-bold text-rose-600">{rec.dose.toFixed(2)} {rec.medicine.unit}</td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-xs">{rec.notes || '-'}</td>
                  <td className="px-6 py-4 text-end">
                    <button onClick={() => setEditRecData(rec)} className="p-1.5 text-slate-600 hover:bg-rose-100 rounded-lg transition me-1"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteRecord(rec.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'records' && sortedRecords.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No treatment records logged.</td></tr>
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
    </>
  );
}
