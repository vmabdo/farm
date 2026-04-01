import ReportsClientView from '@/components/reports/ReportsClientView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'التقارير | Farm ERP',
};

export default function ReportsPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto mt-16 sm:mt-0 print:p-0 print:mt-0 print:max-w-none print:w-full print:block print:overflow-visible">
      <div className="mb-6 print:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">التقارير الشاملة</h1>
        <p className="text-slate-500 mt-2">تخصيص وطباعة التقارير لحركة القطيع والأمور المالية والأعلاف.</p>
      </div>

      <div className="print:block print:w-full print:p-0 print:m-0 print:overflow-visible print:bg-white">
        <ReportsClientView />
      </div>
    </main>
  );
}
