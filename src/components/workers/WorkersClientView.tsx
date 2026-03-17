'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, Edit2, Users, Banknote } from 'lucide-react';
import { deleteWorker, deletePayroll } from '@/app/actions/workers';

import AddWorkerDialog from './AddWorkerDialog';
import EditWorkerDialog from './EditWorkerDialog';
import AddPayrollDialog from './AddPayrollDialog';
import EditPayrollDialog from './EditPayrollDialog';

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

  // Payroll State
  const [payrollSortCol, setPayrollSortCol] = useState<string>('paymentDate');
  const [payrollSortDesc, setPayrollSortDesc] = useState<boolean>(true);
  const [isAddPayrollOpen, setIsAddPayrollOpen] = useState(false);
  const [editPayrollData, setEditPayrollData] = useState<PayrollData | null>(null);

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
    if (confirm('Delete this worker? All their payroll history will be permanently deleted.')) {
      const res = await deleteWorker(id);
      if (!res.success) alert(res.error);
    }
  };

  const handleDeletePayroll = async (id: string) => {
    if (confirm('Delete this salary log?')) {
      const res = await deletePayroll(id);
      if (!res.success) alert(res.error);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex bg-slate-200/50 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('workers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'workers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            Worker Directory
          </button>
          <button 
            onClick={() => setActiveTab('payroll')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'payroll' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            Payroll Logs
          </button>
        </div>

        <div>
          {activeTab === 'workers' && (
            <button
              onClick={() => setIsAddWorkerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <Plus className="w-5 h-5" /> Add Worker
            </button>
          )}
          {activeTab === 'payroll' && (
            <button
              onClick={() => setIsAddPayrollOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Banknote className="w-5 h-5" /> Log Payment
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm whitespace-nowrap">
            
            {/* WORKERS TABLE HEADER */}
            {activeTab === 'workers' && (
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  {[
                    { label: 'Name', key: 'name' },
                    { label: 'Job Role', key: 'role' },
                    { label: 'Base Salary', key: 'salary' },
                    { label: 'National ID', key: 'nationalId' },
                    { label: 'Phone', key: 'phone' },
                    { label: 'Status', key: 'active' },
                  ].map((col) => (
                    <th key={col.key} onClick={() => handleSortWorkers(col.key)} className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none">
                      <div className="flex items-center gap-1">
                        {col.label}
                        {workersSortCol === col.key && (workersSortDesc ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronUp className="w-4 h-4 text-emerald-500" />)}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-end">Actions</th>
                </tr>
              </thead>
            )}

            {/* PAYROLL TABLE HEADER */}
            {activeTab === 'payroll' && (
              <thead className="bg-blue-50/50 border-b border-blue-100 text-slate-600 font-medium">
                <tr>
                  {[
                    { label: 'Date', key: 'paymentDate' },
                    { label: 'Worker Name', key: 'worker' },
                    { label: 'Type', key: 'type' },
                    { label: 'Amount Paid', key: 'amount' },
                    { label: 'Notes', key: 'notes' }
                  ].map((col) => (
                    <th key={col.key} onClick={() => handleSortPayrolls(col.key)} className="px-6 py-4 cursor-pointer hover:bg-blue-100/50 transition select-none">
                      <div className="flex items-center gap-1">
                        {col.label}
                        {payrollSortCol === col.key && (payrollSortDesc ? <ChevronDown className="w-4 h-4 text-blue-500" /> : <ChevronUp className="w-4 h-4 text-blue-500" />)}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-end">Actions</th>
                </tr>
              </thead>
            )}

            <tbody className="divide-y divide-slate-100">
              
              {/* WORKERS ROWS */}
              {activeTab === 'workers' && sortedWorkers.map((worker: WorkerData) => (
                <tr key={worker.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2"><Users className="w-4 h-4 text-slate-400"/> {worker.name}</td>
                  <td className="px-6 py-4 text-slate-600">{worker.role}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">EGP {worker.salary.toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs tracking-wider">{worker.nationalId}</td>
                  <td className="px-6 py-4 text-slate-500">{worker.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${worker.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {worker.active ? 'Present' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <button onClick={() => setEditWorkerData(worker)} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition me-1"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteWorker(worker.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'workers' && sortedWorkers.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No workers found.</td></tr>
              )}

              {/* PAYROLL ROWS */}
              {activeTab === 'payroll' && sortedPayrolls.map((payroll: PayrollData) => (
                <tr key={payroll.id} className="hover:bg-blue-50/20 transition">
                  <td className="px-6 py-4 text-slate-600">{new Date(payroll.paymentDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{payroll.worker.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      payroll.type === 'SALARY' ? 'bg-blue-100 text-blue-700' :
                      payroll.type === 'BONUS' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {payroll.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">EGP {payroll.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-xs">{payroll.notes || '-'}</td>
                  <td className="px-6 py-4 text-end">
                    <button onClick={() => setEditPayrollData(payroll)} className="p-1.5 text-slate-600 hover:bg-blue-100 rounded-lg transition me-1"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeletePayroll(payroll.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'payroll' && sortedPayrolls.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No payroll records logged.</td></tr>
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
    </>
  );
}
