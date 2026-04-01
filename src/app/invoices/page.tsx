import prisma from '@/lib/prisma';
import InvoicesClientView from '@/components/invoices/InvoicesClientView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'الفواتير | Farm ERP',
};

export default async function InvoicesPage() {
  const [invoices, activeCattle] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { invoiceDate: 'desc' },
    }),
    prisma.cattle.findMany({
      where: { status: 'ACTIVE' },
      include: { breed: true },
      orderBy: { tagNumber: 'asc' }
    })
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto mt-16 sm:mt-0">
      <div className="mb-4 print:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">الفواتير</h1>
        <p className="text-slate-500 mt-2">قم بإنشاء وإدارة وطباعة الفواتير الاحترافية.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:hidden">
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-slate-500 mb-1">إجمالي الفواتير</span>
          <span className="text-2xl font-bold text-slate-800">{invoices.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-emerald-600 mb-1">إجمالي المبيعات (ج.م)</span>
          <span className="text-2xl font-bold text-emerald-700">{invoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toFixed(2)}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-rose-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-rose-600 mb-1">إجمالي الخصومات (ج.م)</span>
          <span className="text-2xl font-bold text-rose-700">{invoices.reduce((sum, inv) => sum + inv.discount, 0).toFixed(2)}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-blue-600 mb-1">صافي الأرباح (ج.م)</span>
          <span className="text-2xl font-bold text-blue-700">{invoices.reduce((sum, inv) => sum + inv.netAmount, 0).toFixed(2)}</span>
        </div>
      </div>

      <InvoicesClientView initialInvoices={invoices} cattle={activeCattle} />
    </div>
  );
}
