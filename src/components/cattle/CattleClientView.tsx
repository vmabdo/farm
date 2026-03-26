'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, Edit2, Scale, Search } from 'lucide-react';
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
  const [search, setSearch] = useState('');
  
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'SOLD' | 'DECEASED'>('ACTIVE');
  const [prices, setPrices] = useState<Record<string, number>>({});

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

  const filteredData = useMemo(() => {
    let base = sortedData.filter(c => c.status === activeTab);
    
    const q = search.toLowerCase().trim();
    if (!q) return base;
    return base.filter((c) =>
      [c.tagNumber, c.breed]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [sortedData, search, activeTab]);

  const sortBy = (col: string) => {
    if (sortCol === col) {
      setSortDesc(!sortDesc);
    } else {
      setSortCol(col);
      setSortDesc(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟ سيتم مسح جميع البيانات المرتبطة به.')) {
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2 bg-slate-200/50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {['ACTIVE', 'SOLD', 'DECEASED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              {tab === 'ACTIVE' ? 'القطيع النشط' : tab === 'SOLD' ? 'المباع' : 'النافق'}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث عن القطيع..."
            className="w-full ps-9 pe-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
          />
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          إضافة عجل
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                {[
                  { label: 'رقم البطاقة', key: 'tagNumber' },
                  { label: 'السلالة', key: 'breed' },
                  { label: 'تاريخ الدخول', key: 'entryDate' },
                  { label: 'الوزن المبدئي (كجم)', key: 'entryWeight' },
                  { label: 'الوزن الحالي (كجم)', key: 'currentWeight' },
                  { label: 'آخر فرق (كجم)', key: 'weights' }, // custom sort
                  { label: 'التقييم (السعر/كجم)', key: 'val' },
                  { label: 'الحالة', key: 'status' }
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
                <th className="px-6 py-4 text-end">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((cattle: CattleData) => {
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
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={prices[cattle.id] || ''}
                          onChange={(e) => setPrices(prev => ({ ...prev, [cattle.id]: parseFloat(e.target.value) }))}
                          className="w-20 px-2 py-1 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-500"
                        />
                        <span className="font-semibold text-slate-700">
                          = ج.م {((prices[cattle.id] || 0) * (cattle.currentWeight || cattle.entryWeight)).toFixed(2)}
                        </span>
                      </div>
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
              {filteredData.length === 0 && (
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
