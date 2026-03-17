'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, Edit2, Scale } from 'lucide-react';
import { deleteCattle } from '@/app/actions/cattle';
import AddCattleDialog from './AddCattleDialog';
import EditCattleDialog from './EditCattleDialog';
import WeightDialog from './WeightDialog';

type CattleData = any; // We'll refine this later for stricter types if needed, Prisma generated typings can be complex here

export default function CattleClientView({ rawData }: { rawData: CattleData[] }) {
  const [sortCol, setSortCol] = useState<string>('createdAt');
  const [sortDesc, setSortDesc] = useState<boolean>(true);

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [editCattleData, setEditCattleData] = useState<CattleData | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [weightCattleData, setWeightCattleData] = useState<CattleData | null>(null);
  const [isWeightOpen, setIsWeightOpen] = useState(false);

  // Derive sorted data from rawData on the fly
  const sortedData = useMemo(() => {
    return [...rawData].sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];

      if (sortCol === 'weights') {
        const diffA = getWeightDiff(a);
        const diffB = getWeightDiff(b);
        return sortDesc ? diffB - diffA : diffA - diffB;
      }

      if (sortCol === 'entryDate' || sortCol === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDesc ? 1 : -1;
      if (valA > valB) return sortDesc ? -1 : 1;
      return 0;
    });
  }, [rawData, sortCol, sortDesc]);

  const sortBy = (col: string) => {
    if (sortCol === col) {
      setSortDesc(!sortDesc);
    } else {
      setSortCol(col);
      setSortDesc(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this record? All associated data will be removed.')) {
      const res = await deleteCattle(id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  const getWeightDiff = (cattle: CattleData) => {
    if (!cattle.weights || cattle.weights.length < 2) {
      return (cattle.currentWeight || 0) - cattle.entryWeight; 
    }
    // weights are ordered by date desc
    const latest = cattle.weights[0].weight;
    const previous = cattle.weights[1].weight;
    return latest - previous;
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Cattle
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                {[
                  { label: 'Tag Number', key: 'tagNumber' },
                  { label: 'Breed', key: 'breed' },
                  { label: 'Entry Date', key: 'entryDate' },
                  { label: 'Init. Wt(kg)', key: 'entryWeight' },
                  { label: 'Curr. Wt(kg)', key: 'currentWeight' },
                  { label: 'Latest Diff(kg)', key: 'weights' }, // custom sort
                  { label: 'Status', key: 'status' }
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => sortBy(col.key)}
                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortCol === col.key && (
                        sortDesc ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronUp className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedData.map((cattle: CattleData) => {
                const diff = getWeightDiff(cattle);
                const diffColor = diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-slate-500';
                
                return (
                  <tr key={cattle.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{cattle.tagNumber}</td>
                    <td className="px-6 py-4 text-slate-600">{cattle.breed || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(cattle.entryDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-600">{cattle.entryWeight.toFixed(2)}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{cattle.currentWeight?.toFixed(2) || '-'}</td>
                    <td className={`px-6 py-4 font-medium ${diffColor}`}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        cattle.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                        cattle.status === 'SOLD' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {cattle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-end flex items-center justify-end gap-2">
                       <button
                        onClick={() => { setWeightCattleData(cattle); setIsWeightOpen(true); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition tooltip"
                        title="Add Weight"
                      >
                        <Scale className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditCattleData(cattle); setIsEditOpen(true); }}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cattle.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {sortedData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    No cattle records found. Add some to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddCattleDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      {editCattleData && (
        <EditCattleDialog 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          cattle={editCattleData} 
        />
      )}
      {weightCattleData && (
        <WeightDialog 
          isOpen={isWeightOpen} 
          onClose={() => setIsWeightOpen(false)} 
          cattle={weightCattleData} 
        />
      )}
    </>
  );
}
