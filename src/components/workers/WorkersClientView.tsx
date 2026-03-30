'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, Edit2, Users, Banknote, Search } from 'lucide-react';
import { deleteWorker, deletePayroll } from '@/app/actions/workers';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

import AddWorkerDialog from './AddWorkerDialog';
import EditWorkerDialog from './EditWorkerDialog';
import AddPayrollDialog from './AddPayrollDialog';
import EditPayrollDialog from './EditPayrollDialog';
import PayslipDialog from './PayslipDialog';

type WorkerData = any;
type PayrollData = any;

export default function WorkersClientView({ 
  initialWorkers, 
  initialPayrolls
}: { 
  initialWorkers: WorkerData[], 
  initialPayrolls: PayrollData[] 
}) {
  const [activeTab, setActiveTab] = useState<'workers' | 'payroll'>('workers');

  // Workers State
  const [workersSortCol, setWorkersSortCol] = useState<string>('name');
  const [workersSortDesc, setWorkersSortDesc] = useState<boolean>(false);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [editWorkerData, setEditWorkerData] = useState<WorkerData | null>(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [payslipWorker, setPayslipWorker] = useState<WorkerData | null>(null);

  // Payroll State
  const [payrollSortCol, setPayrollSortCol] = useState<string>('paymentDate');
  const [payrollSortDesc, setPayrollSortDesc] = useState<boolean>(true);
  const [isAddPayrollOpen, setIsAddPayrollOpen] = useState(false);
  const [editPayrollData, setEditPayrollData] = useState<PayrollData | null>(null);
  const [search, setSearch] = useState('');

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean; title: string; message: string; confirmText: string;
    variant: 'danger' | 'warning' | 'primary'; onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', confirmText: 'تأكيد', variant: 'danger', onConfirm: () => {} });
  const openConfirm = (opts: Omit<typeof confirmState, 'isOpen'>) => setConfirmState({ isOpen: true, ...opts });
  const closeConfirm = () => setConfirmState((s) => ({ ...s, isOpen: false }));

  // ==========================
  // Memoized Sorted Data
  // ==========================
  const sortedWorkers = useMemo(() => {
    return [...initialWorkers].sort((a, b) => {
      let valA = a[workersSortCol];
      let valB = b[workersSortCol];
      
      if (workersSortCol === 'startDate' || workersSortCol === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return workersSortDesc ? 1 : -1;
      if (valA > valB) return workersSortDesc ? -1 : 1;
      return 0;
    });
  }, [initialWorkers, workersSortCol, workersSortDesc]);

  const sortedPayrolls = useMemo(() => {
    return [...initialPayrolls].sort((a, b) => {
      let valA = payrollSortCol === 'worker' ? a.worker?.name : a[payrollSortCol];
      let valB = payrollSortCol === 'worker' ? b.worker?.name : b[payrollSortCol];
      
      if (payrollSortCol === 'paymentDate' || payrollSortCol === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return payrollSortDesc ? 1 : -1;
      if (valA > valB) return payrollSortDesc ? -1 : 1;
      return 0;
    });
  }, [initialPayrolls, payrollSortCol, payrollSortDesc]);

  const filteredWorkers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sortedWorkers;
    return sortedWorkers.filter((w) =>
      [w.name, w.role, w.nationalId, w.phone]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [sortedWorkers, search]);

  const filteredPayrolls = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sortedPayrolls;
    return sortedPayrolls.filter((p) =>
      [p.worker?.name, p.type, p.notes]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [sortedPayrolls, search]);

  // ==========================
  // Handlers
  // ==========================
  const handleSortWorkers = (col: string) => {
    if (workersSortCol === col) setWorkersSortDesc(!workersSortDesc);
    else { setWorkersSortCol(col); setWorkersSortDesc(true); }
  };
  const handleSortPayrolls = (col: string) => {
    if (payrollSortCol === col) setPayrollSortDesc(!payrollSortDesc);
    else { setPayrollSortCol(col); setPayrollSortDesc(true); }
  };

  const handleDeleteWorker = async (id: string) => {
    openConfirm({
      title: 'حذف العامل',
      message: 'هل أنت متأكد من حذف هذا العامل؟ سيتم حذف جميع سجلات الرواتب الخاصة به بشكل دائم.',
      confirmText: 'حذف العامل',
      variant: 'danger',
      onConfirm: async () => { const res = await deleteWorker(id); if (!res.success) alert(res.error); },
    });
  };

  const handleDeletePayroll = async (id: string) => {
    openConfirm({
      title: 'حذف سجل الراتب',
      message: 'هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.',
      confirmText: 'حذف السجل',
      variant: 'danger',
      onConfirm: async () => { const res = await deletePayroll(id); if (!res.success) alert(res.error); },
    });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('workers')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-medium transition ${
              activeTab === 'workers' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            العمال
          </button>
          <button 
            onClick={() => setActiveTab('payroll')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-medium transition ${
              activeTab === 'payroll' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Banknote className="w-4 h-4" />
            سجل الرواتب
          </button>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث بالاسم أو الوظيفة أو الرقم القومي..."
            className="w-full ps-9 pe-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
          />
        </div>

        <div>
          {activeTab === 'workers' && (
            <button
              onClick={() => setIsAddWorkerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
            >
              <Plus className="w-5 h-5" />إضافة عامل</button>
          )}
          {activeTab === 'payroll' && (
            <button
              onClick={() => setIsAddPayrollOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              <Banknote className="w-5 h-5" />تسجيل دفعة</button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm whitespace-nowrap">
            
            {/* WORKERS TABLE HEADER */}
            {activeTab === 'workers' && (
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  {[
                    { label: 'الاسم', key: 'name' },
                    { label: 'الوظيفة', key: 'role' },
                    { label: 'الراتب الأساسي', key: 'salary' },
                    { label: 'الرقم القومي', key: 'nationalId' },
                    { label: 'الهاتف', key: 'phone' },
                    { label: 'الحالة', key: 'active' },
                  ].map((col) => (
                    <th key={col.key} onClick={() => handleSortWorkers(col.key)} className="px-8 py-5 cursor-pointer hover:bg-slate-100 transition select-none">
                      <div className="flex items-center gap-1">
                        {col.label}
                        {workersSortCol === col.key && (workersSortDesc ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronUp className="w-4 h-4 text-emerald-500" />)}
                      </div>
                    </th>
                  ))}
                  <th className="px-8 py-5 text-end">الإجراءات</th>
                </tr>
              </thead>
            )}

            {/* PAYROLL TABLE HEADER */}
            {activeTab === 'payroll' && (
              <thead className="bg-blue-50/50 border-b border-blue-100 text-slate-600 font-medium">
                <tr>
                  {[
                    { label: 'التاريخ', key: 'paymentDate' },
                    { label: 'اسم العامل', key: 'worker' },
                    { label: 'النوع', key: 'type' },
                    { label: 'المبلغ المدفوع', key: 'amount' },
                    { label: 'ملاحظات', key: 'notes' }
                  ].map((col) => (
                    <th key={col.key} onClick={() => handleSortPayrolls(col.key)} className="px-8 py-5 cursor-pointer hover:bg-blue-100/50 transition select-none">
                      <div className="flex items-center gap-1">
                        {col.label}
                        {payrollSortCol === col.key && (payrollSortDesc ? <ChevronDown className="w-4 h-4 text-blue-500" /> : <ChevronUp className="w-4 h-4 text-blue-500" />)}
                      </div>
                    </th>
                  ))}
                  <th className="px-8 py-5 text-end">الإجراءات</th>
                </tr>
              </thead>
            )}

            <tbody className="divide-y divide-slate-100">
              
              {/* WORKERS ROWS */}
              {activeTab === 'workers' && filteredWorkers.map((worker: WorkerData) => (
                <tr key={worker.id} className="hover:bg-slate-50 transition">
                  <td className="px-8 py-5 font-semibold text-slate-900 flex items-center gap-2"><Users className="w-4 h-4 text-slate-400"/> {worker.name}</td>
                  <td className="px-8 py-5 text-slate-600">{worker.role}</td>
                  <td className="px-8 py-5 font-bold text-slate-700">ج.م {worker.salary.toFixed(2)}</td>
                  <td className="px-8 py-5 text-slate-500 font-mono text-xs tracking-wider">{worker.nationalId}</td>
                  <td className="px-8 py-5 text-slate-500">{worker.phone || '-'}</td>
                  <td className="px-8 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${worker.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {worker.active ? 'متواجد' : 'غير متواجد'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-end flex items-center justify-end gap-2">
                    <button onClick={() => { setPayslipWorker(worker); setIsPayslipOpen(true); }} className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition whitespace-nowrap">
                      كشف راتب
                    </button>
                    <button onClick={() => setEditWorkerData(worker)} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-xl transition"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteWorker(worker.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'workers' && filteredWorkers.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">لا يوجد عمال.</td></tr>
              )}

              {/* PAYROLL ROWS */}
              {activeTab === 'payroll' && filteredPayrolls.map((payroll: PayrollData) => (
                <tr key={payroll.id} className="hover:bg-blue-50/20 transition">
                  <td className="px-8 py-5 text-slate-600">{new Date(payroll.paymentDate).toLocaleDateString()}</td>
                  <td className="px-8 py-5 font-medium text-slate-900">{payroll.worker.name}</td>
                  <td className="px-8 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      payroll.type === 'SALARY' ? 'bg-blue-100 text-blue-700' :
                      payroll.type === 'BONUS' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {payroll.type === 'SALARY' ? 'راتب' : payroll.type === 'BONUS' ? 'مكافأة' : 'سلفة'}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-700">ج.م {payroll.amount.toFixed(2)}</td>
                  <td className="px-8 py-5 text-slate-500 truncate max-w-xs">{payroll.notes || '-'}</td>
                  <td className="px-8 py-5 text-end">
                    <button onClick={() => setEditPayrollData(payroll)} className="p-1.5 text-slate-600 hover:bg-blue-100 rounded-xl transition me-1"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeletePayroll(payroll.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'payroll' && filteredPayrolls.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">لا يوجد سجلات رواتب.</td></tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddWorkerDialog isOpen={isAddWorkerOpen} onClose={() => setIsAddWorkerOpen(false)} />
      {editWorkerData && <EditWorkerDialog isOpen={!!editWorkerData} onClose={() => setEditWorkerData(null)} worker={editWorkerData} />}
      
      <AddPayrollDialog isOpen={isAddPayrollOpen} onClose={() => setIsAddPayrollOpen(false)} workers={initialWorkers} />
      {editPayrollData && <EditPayrollDialog isOpen={!!editPayrollData} onClose={() => setEditPayrollData(null)} payroll={editPayrollData} />}
      {payslipWorker && (
        <PayslipDialog
          isOpen={isPayslipOpen}
          onClose={() => { setIsPayslipOpen(false); setPayslipWorker(null); }}
          worker={payslipWorker}
          payrolls={initialPayrolls}
        />
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
