'use client';

import { X, Printer, Tractor } from 'lucide-react';

export default function InvoicePrintDialog({ isOpen, onClose, invoice }: { isOpen: boolean; onClose: () => void; invoice: any }) {
  if (!isOpen || !invoice) return null;

  let items = [];
  try {
    items = JSON.parse(invoice.items);
  } catch (e) {
    items = [];
  }

  // Generate random invoice ID for the UI based on DB CUID
  const invoiceNumber = `INV-${invoice.id.substring(invoice.id.length - 6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 print:p-0 print:bg-white overflow-y-auto">
      {/* Container - takes full width on print */}
      <div className="bg-white rounded-none sm:rounded-2xl shadow-xl w-full max-w-4xl min-h-screen sm:min-h-[85vh] flex flex-col relative print:shadow-none print:w-full print:absolute print:inset-0" onClick={(e) => e.stopPropagation()}>
        
        {/* Print-hidden header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 print:hidden bg-slate-50 sticky top-0 z-10">
          <button 
            onClick={() => window.print()}
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />طباعة الفاتورة</button>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===================== PRINTABLE A4 AREA ===================== */}
        <div className="flex-1 p-8 sm:p-12 print:p-8 bg-white text-slate-900 mx-auto w-full max-w-[210mm]">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-12 border-b-2 border-slate-900 pb-8">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <Tractor className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">اسم الشركة</h1>
                <p className="text-slate-500 font-medium">مزرعة نموذجية ممتازة</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-black text-slate-200 tracking-widest uppercase mb-2">فاتورة</h2>
              <p className="text-sm text-slate-600 font-bold">رقم {invoiceNumber}</p>
              <p className="text-sm text-slate-600">التاريخ: {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid grid-cols-2 gap-12 mb-10">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">فاتورة إلى:</p>
              <h3 className="text-xl font-bold text-slate-900">{invoice.clientName}</h3>
              <p className="text-slate-600 mt-1">عميل مميز</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">الدفع إلى:</p>
              <h3 className="text-lg font-bold text-slate-900">اسم الشركة</h3>
              <p className="text-slate-600 mt-1">123 طريق الزراعة<br/>القاهرة، مصر</p>
            </div>
          </div>

          {/* Table */}
          <div className="mb-8 border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 text-sm font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200 text-center w-16">#</th>
                  <th className="px-6 py-4 border-b border-slate-200">البيان</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right w-32">الكمية</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right w-32">سعر الوحدة</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right w-40">المجموع</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 divide-y divide-slate-100">
                {items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-right">{item.quantity}</td>
                    <td className="px-6 py-4 text-right">{item.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-semibold">{(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summaries */}
          <div className="flex justify-between items-start">
            <div className="w-1/2 pe-8">
              {invoice.notes && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ملاحظات / شروط:</p>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </div>
            <div className="w-96">
              <div className="space-y-4 pt-2">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>المجموع الفرعي</span>
                  <span>ج.م {(invoice.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>الخصم</span>
                  <span>- ج.م {invoice.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-slate-900 pt-4 border-t-2 border-slate-900">
                  <span>الإجمالي</span>
                  <span>ج.م {invoice.netAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
            <p>شكراً لتعاملكم معنا!</p>
            <p className="mt-1 font-medium">يستحق الدفع خلال 15 يوماً من تاريخ الفاتورة.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
