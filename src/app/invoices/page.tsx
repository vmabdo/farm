import prisma from '@/lib/prisma';
import InvoicesClientView from '@/components/invoices/InvoicesClientView';

export const metadata = {
  title: 'الفواتير والتقارير | Farm ERP',
};

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { invoiceDate: 'desc' },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto mt-16 sm:mt-0">
      <div className="mb-8 print:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">الفواتير والتقارير</h1>
        <p className="text-slate-500 mt-2">قم بإنشاء وإدارة وطباعة الفواتير الاحترافية.</p>
      </div>

      <InvoicesClientView initialInvoices={invoices} />
    </div>
  );
}
