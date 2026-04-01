import prisma from '@/lib/prisma';
import WorkersClientView from '@/components/workers/WorkersClientView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WorkersPage() {
  const [workers, payrolls] = await Promise.all([
    prisma.worker.findMany({ orderBy: { name: 'asc' } }),
    prisma.payroll.findMany({ 
      include: { worker: true },
      orderBy: { paymentDate: 'desc' } 
    }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">العمال والرواتب</h1>
          <p className="text-slate-500 mt-2">إدارة سجلات الموظفين وتتبع صرف الرواتب والسلف.</p>
        </div>
      </header>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-slate-500 mb-1">إجمالي العمال</span>
          <span className="text-2xl font-bold text-slate-800">{workers.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-emerald-600 mb-1">على رأس العمل</span>
          <span className="text-2xl font-bold text-emerald-700">{workers.filter(w => w.active).length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-blue-600 mb-1">سجلات المدفوعات</span>
          <span className="text-2xl font-bold text-blue-700">{payrolls.length}</span>
        </div>
      </div>

      <WorkersClientView 
        initialWorkers={workers}
        initialPayrolls={payrolls}
      />
    </div>
  );
}
