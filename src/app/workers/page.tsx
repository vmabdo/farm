import prisma from '@/lib/prisma';
import WorkersClientView from '@/components/workers/WorkersClientView';

export const dynamic = 'force-dynamic';

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
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">العمال والرواتب</h1>
          <p className="text-slate-500 mt-2">إدارة سجلات الموظفين وتتبع صرف الرواتب والسلف.</p>
        </div>
      </header>

      <WorkersClientView 
        initialWorkers={workers}
        initialPayrolls={payrolls}
      />
    </div>
  );
}
