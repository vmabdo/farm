'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, Edit2, Scale, Search, List, Settings, Skull } from 'lucide-react';
import { deleteCattle, markDeceased } from '@/app/actions/cattle';
import AddCattleDialog from './AddCattleDialog';
import EditCattleDialog from './EditCattleDialog';
import WeightDialog from './WeightDialog';
import BreedsDialog from './BreedsDialog';
import WeightHistoryDialog from './WeightHistoryDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

type CattleData = any;

export default function CattleClientView({ rawData, breeds }: { rawData: CattleData[], breeds: any[] }) {
  const [sortCol, setSortCol] = useState<string>('createdAt');
  const [sortDesc, setSortDesc] = useState<boolean>(true);

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [editCattleData, setEditCattleData] = useState<CattleData | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [weightCattleData, setWeightCattleData] = useState<CattleData | null>(null);
  const [isWeightOpen, setIsWeightOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const [isBreedsOpen, setIsBreedsOpen] = useState(false);
  const [historyCattleData, setHistoryCattleData] = useState<CattleData | null>(null);
  
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'SOLD' | 'DECEASED'>('ACTIVE');
  const [prices, setPrices] = useState<Record<string, number>>({});

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false, title: '', message: '', confirmText: 'تأكيد', variant: 'danger', onConfirm: () => {},
  });

  const openConfirm = (opts: Omit<typeof confirmState, 'isOpen'>) =>
    setConfirmState({ isOpen: true, ...opts });
  const closeConfirm = () => setConfirmState((s) => ({ ...s, isOpen: false }));

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

      if (sortCol === 'breed') {
        valA = a.breed?.name || '-';
        valB = b.breed?.name || '-';
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
      [c.tagNumber, c.breed?.name]
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
    openConfirm({
      title: 'حذف سجل العجل',
      message: 'هل أنت متأكد من حذف هذا السجل؟ سيتم مسح جميع البيانات المرتبطة به بشكل دائم.',
      confirmText: 'حذف السجل',
      variant: 'danger',
      onConfirm: async () => {
        const res = await deleteCattle(id);
        if (!res.success) alert(res.error);
      },
    });
  };

  const handleMarkDeceased = async (id: string) => {
    openConfirm({
      title: 'تسجيل العجل كنافق',
      message: 'هل أنت متأكد من تسجيل هذا العجل كنافق؟ لا يمكن التراجع عن هذا الإجراء.',
      confirmText: 'تسجيل كنافق',
      variant: 'warning',
      onConfirm: async () => {
        const res = await markDeceased(id);
        if (!res.success) alert(res.error);
      },
    });
  };

  const getWeightDiff = (cattle: CattleData) => {
    if (cattle.lastWeightDifference !== null && cattle.lastWeightDifference !== undefined) {
      return cattle.lastWeightDifference;
    }
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
              className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
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
            className="w-full ps-9 pe-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBreedsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition whitespace-nowrap font-medium"
          >
            <Settings className="w-5 h-5" />
            إدارة السلالات
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            إضافة عجل
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                {[
                  { label: 'رقم العجل', key: 'tagNumber' },
                  { label: 'السلالة', key: 'breed' },
                  { label: 'تاريخ الدخول', key: 'entryDate' },
                  { label: 'الوزن المبدئي (كجم)', key: 'entryWeight' },
                  { label: 'الوزن الحالي (كجم)', key: 'currentWeight' },
                  { label: 'آخر فرق (كجم)', key: 'weights' }, // custom sort
                  ...(activeTab === 'SOLD' ? [
                    { label: 'المشتري', key: 'buyerName' },
                    { label: 'الفاتورة', key: 'invoiceSerialNumber' }
                  ] : [
                    { label: 'التقييم (السعر/كجم)', key: 'val' }
                  ]),
                  { label: 'الحالة', key: 'status' }
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => sortBy(col.key)}
                    className="px-8 py-5 cursor-pointer hover:bg-slate-100 transition select-none"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortCol === col.key && (
                        sortDesc ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronUp className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-8 py-5 text-end">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((cattle: CattleData) => {
                const diff = getWeightDiff(cattle);
                const diffColor = diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-slate-500';
                
                return (
                  <tr key={cattle.id} className={`transition border-s-4 ${cattle.status === 'DECEASED' ? 'border-rose-500 bg-rose-50' : 'border-transparent hover:bg-slate-50'}`}>
                    <td className="px-8 py-5 font-semibold text-slate-900">{cattle.tagNumber}</td>
                    <td className="px-8 py-5 text-slate-600">{cattle.breed?.name || '-'}</td>
                    <td className="px-8 py-5 text-slate-600">{new Date(cattle.entryDate).toLocaleDateString()}</td>
                    <td className="px-8 py-5 text-slate-600">{cattle.entryWeight.toFixed(2)}</td>
                    <td className="px-8 py-5 font-medium text-slate-800">{cattle.currentWeight?.toFixed(2) || '-'}</td>
                    <td className={`px-8 py-5 font-medium ${diffColor}`}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                    </td>
                    {activeTab === 'SOLD' ? (
                      <>
                        <td className="px-8 py-5 font-semibold text-slate-800">{cattle.buyerName || '-'}</td>
                        <td className="px-8 py-5 font-mono text-slate-600">{cattle.invoiceSerialNumber ? `#INV-${cattle.invoiceSerialNumber}` : '-'}</td>
                      </>
                    ) : (
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder={cattle.breed?.pricePerKg?.toFixed(2) || "0.00"}
                            value={prices[cattle.id] || ''}
                            onChange={(e) => setPrices(prev => ({ ...prev, [cattle.id]: parseFloat(e.target.value) }))}
                            className="w-20 px-2 py-1 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-500"
                          />
                          <span className="font-semibold text-slate-700">
                            = ج.م {((prices[cattle.id] || cattle.breed?.pricePerKg || 0) * (cattle.currentWeight || cattle.entryWeight)).toFixed(2)}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        cattle.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                        cattle.status === 'SOLD' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {cattle.status === 'ACTIVE' ? 'القطيع النشط' : cattle.status === 'SOLD' ? 'مباع' : 'نافق'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-end flex items-center justify-end gap-2">
                       <button
                        onClick={() => setHistoryCattleData(cattle)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition tooltip"
                        title="سجل الأوزان"
                      >
                        <List className="w-4 h-4" />
                      </button>
                       <button
                        onClick={() => { setWeightCattleData(cattle); setIsWeightOpen(true); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition tooltip"
                        title="Add Weight"
                      >
                        <Scale className="w-4 h-4" />
                      </button>
                      {cattle.status !== 'DECEASED' && cattle.status !== 'SOLD' && (
                        <button
                          onClick={() => { setEditCattleData(cattle); setIsEditOpen(true); }}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-xl transition"
                          title="تعديل (Edit)"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {cattle.status !== 'DECEASED' && cattle.status !== 'SOLD' && (
                        <button
                          onClick={() => handleMarkDeceased(cattle.id)}
                          className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-xl transition tooltip"
                          title="تسجيل نافق"
                        >
                          <Skull className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(cattle.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition"
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

      <AddCattleDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} breeds={breeds} />
      {editCattleData && (
        <EditCattleDialog 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          cattle={editCattleData} 
          breeds={breeds}
        />
      )}
      {weightCattleData && (
        <WeightDialog 
          isOpen={isWeightOpen} 
          onClose={() => setIsWeightOpen(false)} 
          cattle={weightCattleData} 
        />
      )}
      <BreedsDialog isOpen={isBreedsOpen} onClose={() => setIsBreedsOpen(false)} breeds={breeds} />
      {historyCattleData && (
        <WeightHistoryDialog isOpen={!!historyCattleData} onClose={() => setHistoryCattleData(null)} cattle={historyCattleData} />
      )}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        variant={confirmState.variant}
      />
    </>
  );
}
