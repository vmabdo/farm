'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, Search, ShoppingBag, ChevronUp, ChevronDown } from 'lucide-react';
import { createExpense, updateExpense, deleteExpense } from '@/app/actions/expenses';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

type Expense = {
  id: string;
  itemName: string;
  cost: number;
  date: Date;
  createdAt: Date;
};

// ─── Add / Edit Dialog ─────────────────────────────────────────────────────
function ExpenseDialog({
  isOpen,
  onClose,
  expense,
}: {
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense | null;
}) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!expense;

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = isEdit
      ? await updateExpense(expense!.id, fd)
      : await createExpense(fd);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      alert(res.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {isEdit ? 'تعديل مصروف' : 'إضافة مصروف جديد'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">اسم البند / الصنف *</label>
            <input
              name="itemName"
              required
              defaultValue={expense?.itemName}
              placeholder="مثال: سماد، كهرباء، أدوات..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">التكلفة (ج.م) *</label>
            <input
              name="cost"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={expense?.cost}
              placeholder="0.00"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">التاريخ *</label>
            <input
              name="date"
              type="date"
              required
              defaultValue={
                expense
                  ? new Date(expense.date).toISOString().split('T')[0]
                  : new Date().toISOString().split('T')[0]
              }
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 transition disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : isEdit ? 'تعديل' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Client View ───────────────────────────────────────────────────────
export default function ExpensesClientView({ initialExpenses }: { initialExpenses: Expense[] }) {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('date');
  const [sortDesc, setSortDesc] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean; title: string; message: string;
    confirmText: string; variant: 'danger' | 'warning' | 'primary'; onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', confirmText: 'تأكيد', variant: 'danger', onConfirm: () => {} });
  const openConfirm = (opts: Omit<typeof confirmState, 'isOpen'>) =>
    setConfirmState({ isOpen: true, ...opts });
  const closeConfirm = () => setConfirmState((s) => ({ ...s, isOpen: false }));

  const sortBy = (col: string) => {
    if (sortCol === col) setSortDesc(!sortDesc);
    else { setSortCol(col); setSortDesc(true); }
  };

  const sorted = useMemo(() => {
    return [...initialExpenses].sort((a, b) => {
      let va: any = (a as any)[sortCol];
      let vb: any = (b as any)[sortCol];
      if (sortCol === 'date' || sortCol === 'createdAt') {
        va = new Date(va).getTime();
        vb = new Date(vb).getTime();
      }
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return sortDesc ? 1 : -1;
      if (va > vb) return sortDesc ? -1 : 1;
      return 0;
    });
  }, [initialExpenses, sortCol, sortDesc]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sorted;
    return sorted.filter((e) => e.itemName.toLowerCase().includes(q));
  }, [sorted, search]);

  const totalCost = filtered.reduce((s, e) => s + e.cost, 0);

  const handleDelete = (id: string) => {
    openConfirm({
      title: 'حذف المصروف',
      message: 'هل أنت متأكد من حذف هذا البند؟ لا يمكن التراجع.',
      confirmText: 'حذف',
      variant: 'danger',
      onConfirm: async () => {
        const res = await deleteExpense(id);
        if (!res.success) alert(res.error);
      },
    });
  };

  const SortIcon = ({ col }: { col: string }) =>
    sortCol === col ? (
      sortDesc ? <ChevronDown className="w-4 h-4 text-rose-500" /> : <ChevronUp className="w-4 h-4 text-rose-500" />
    ) : null;

  const cols = [
    { label: 'البند / الصنف', key: 'itemName' },
    { label: 'التاريخ', key: 'date' },
    { label: 'التكلفة (ج.م)', key: 'cost' },
  ];

  return (
    <>
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        {/* Summary badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-2.5">
            <ShoppingBag className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-medium text-slate-600">إجمالي المصروفات:</span>
            <span className="font-black text-rose-700 text-base">
              {totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث عن صنف..."
              className="w-full ps-9 pe-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900
                         placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition bg-white"
            />
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition whitespace-nowrap font-medium shadow-sm shadow-rose-200"
          >
            <Plus className="w-5 h-5" />
            إضافة مصروف
          </button>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                {cols.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => sortBy(col.key)}
                    className="px-8 py-5 cursor-pointer hover:bg-slate-100 transition select-none"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon col={col.key} />
                    </div>
                  </th>
                ))}
                <th className="px-8 py-5 text-end">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition">
                  <td className="px-8 py-5 font-semibold text-slate-800">{exp.itemName}</td>
                  <td className="px-8 py-5 text-slate-500">
                    {new Date(exp.date).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full text-sm">
                      {exp.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
                    </span>
                  </td>
                  <td className="px-8 py-5 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditExpense(exp)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-xl transition"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>لا توجد مصروفات مسجلة. ابدأ بإضافة أول بند.</p>
                  </td>
                </tr>
              )}
              {filtered.length > 0 && (
                <tr className="bg-rose-50/70 font-bold border-t-2 border-rose-200">
                  <td className="px-8 py-4 text-rose-800" colSpan={2}>الإجمالي</td>
                  <td className="px-8 py-4 text-rose-700 text-base">
                    {totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
                  </td>
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Dialogs ─────────────────────────────────────────────────── */}
      <ExpenseDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <ExpenseDialog
        isOpen={!!editExpense}
        onClose={() => setEditExpense(null)}
        expense={editExpense}
      />
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
