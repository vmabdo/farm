'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, Search, Printer, Receipt } from 'lucide-react';
import { deleteInvoice } from '@/app/actions/invoices';

import CreateInvoiceDialog from './CreateInvoiceDialog';
import InvoicePrintDialog from './InvoicePrintDialog';

type InvoiceData = any;

export default function InvoicesClientView({ initialInvoices, cattle }: { initialInvoices: InvoiceData[], cattle: any[] }) {
  const [sortCol, setSortCol] = useState<string>('invoiceDate');
  const [sortDesc, setSortDesc] = useState<boolean>(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [printData, setPrintData] = useState<InvoiceData | null>(null);
  const [search, setSearch] = useState('');

  // ==========================
  // Memoized Sorted Data
  // ==========================
  const sortedInvoices = useMemo(() => {
    return [...initialInvoices].sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];
      
      if (sortCol === 'invoiceDate') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDesc ? 1 : -1;
      if (valA > valB) return sortDesc ? -1 : 1;
      return 0;
    });
  }, [initialInvoices, sortCol, sortDesc]);

  const filteredInvoices = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sortedInvoices;
    return sortedInvoices.filter((t) =>
      [t.clientName, t.notes, String(t.serialNumber)]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [sortedInvoices, search]);

  // ==========================
  // Handlers
  // ==========================
  const handleSort = (col: string) => {
    if (sortCol === col) setSortDesc(!sortDesc);
    else { setSortCol(col); setSortDesc(true); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      const res = await deleteInvoice(id);
      if (!res.success) alert(res.error);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 print:hidden">
        {/* Search bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث برقم الفاتورة أو اسم العميل..."
            className="w-full ps-9 pe-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
          />
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />إنشاء فاتورة</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                {[
                  { label: 'رقم الفاتورة', key: 'serialNumber' },
                  { label: 'التاريخ', key: 'invoiceDate' },
                  { label: 'اسم العميل', key: 'clientName' },
                  { label: 'الإجمالي (ج.م)', key: 'totalAmount' },
                  { label: 'الخصم', key: 'discount' },
                  { label: 'الصافي (ج.م)', key: 'netAmount' },
                ].map((col) => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none">
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortCol === col.key && (sortDesc ? <ChevronDown className="w-4 h-4 text-blue-500" /> : <ChevronUp className="w-4 h-4 text-blue-500" />)}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-end">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv: InvoiceData) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-mono font-medium text-slate-800">#INV-{inv.serialNumber}</td>
                  <td className="px-6 py-4 text-slate-600">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2"><Receipt className="w-4 h-4 text-slate-400"/> {inv.clientName}</td>
                  <td className="px-6 py-4 text-slate-600">{inv.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-rose-600 font-medium">-{inv.discount.toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{inv.netAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-end flex flex-nowrap items-center justify-end gap-2">
                    <button onClick={() => setPrintData(inv)} className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition whitespace-nowrap flex items-center gap-1">
                      <Printer className="w-3 h-3" /> عرض / طباعة
                    </button>
                    <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">لا توجد فواتير تم إنشاؤها.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateInvoiceDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} cattle={cattle} />
      {printData && <InvoicePrintDialog isOpen={!!printData} onClose={() => setPrintData(null)} invoice={printData} />}
    </>
  );
}
