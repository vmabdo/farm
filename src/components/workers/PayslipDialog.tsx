'use client';

import { X, Receipt, Download } from 'lucide-react';

export default function PayslipDialog({ 
  isOpen, 
  onClose, 
  worker, 
  payrolls = [] 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  worker: any; 
  payrolls: any[]; 
}) {
  if (!isOpen || !worker) return null;

  // Filter payrolls for this specific worker
  const workerPayrolls = payrolls.filter(p => p.workerId === worker.id);
  
  // Calculate totals
  const totalBonuses = workerPayrolls
    .filter(p => p.type === 'BONUS')
    .reduce((sum, p) => sum + p.amount, 0);
    
  // Allow for both 'DEDUCTION' and 'DEDUCT' depending on old data, defaults to 0 safely
  const totalDeductions = workerPayrolls
    .filter(p => p.type?.includes('DEDUCT'))
    .reduce((sum, p) => sum + p.amount, 0);

  // General "SALARY" payments logging
  const salaryPayments = workerPayrolls
    .filter(p => p.type === 'SALARY')
    .reduce((sum, p) => sum + p.amount, 0);

  // Net calculation mapping logic: Base Salary + Bonuses - Deductions
  const netEarnings = worker.salary + totalBonuses - totalDeductions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-emerald-50/50">
          <div className="flex items-center gap-3 text-emerald-700">
            <Receipt className="w-6 h-6" />
            <h2 className="text-xl font-bold">كشف حساب</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">بيانات الموظف</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{worker.name}</h3>
              <p className="text-slate-600 mt-1">{worker.role} | الرقم القومي: {worker.nationalId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">الراتب الأساسي</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">ج.م {worker.salary.toFixed(2)}</h3>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-5 py-3">التاريخ</th>
                  <th className="px-5 py-3">النوع</th>
                  <th className="px-5 py-3">ملاحظات</th>
                  <th className="px-5 py-3 text-right">المبلغ (ج.م)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workerPayrolls.length > 0 ? (
                  workerPayrolls.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3 text-slate-600">
                        {new Date(log.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          log.type === 'BONUS' ? 'bg-emerald-100 text-emerald-700' :
                          log.type.includes('DEDUCT') ? 'bg-rose-100 text-rose-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 truncate max-w-[200px]">
                        {log.notes || '-'}
                      </td>
                      <td className={`px-5 py-3 text-right font-medium ${
                         log.type.includes('DEDUCT') ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {log.type.includes('DEDUCT') ? '-' : '+'}{log.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                      لا يوجد سجلات رواتب.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>الراتب الأساسي</span>
                <span className="font-medium">ج.م {worker.salary.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-600">
                <span>إجمالي المكافآت</span>
                <span className="font-medium">+ج.م {totalBonuses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-rose-600">
                <span>إجمالي الخصومات والسلف</span>
                <span className="font-medium">-ج.م {totalDeductions.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-blue-600">
                <span>رواتب منصرفة</span>
                <span className="font-medium">-ج.م {salaryPayments.toFixed(2)}</span>
              </div>
              
              <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center text-lg font-bold text-slate-900">
                <span>الصافي المستحق</span>
                <span>ج.م {netEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
             <button 
              onClick={() => window.print()}
              className="px-5 py-2 flex items-center gap-2 border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 rounded-lg transition"
            >
              <Download className="w-4 h-4" /> طباعة
            </button>
            <button 
              onClick={onClose}
              className="px-5 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
