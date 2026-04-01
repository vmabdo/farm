import prisma from '@/lib/prisma';
import ExpensesClientView from '@/components/expenses/ExpensesClientView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'المصروفات العامة | Farm ERP',
};

export default async function ExpensesPage() {
  const expenses = await prisma.generalExpense.findMany({
    orderBy: { date: 'desc' },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto mt-16 sm:mt-0">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">المصروفات العامة</h1>
        <p className="text-slate-500 mt-2">تتبع وإدارة المصروفات اليومية والتشغيلية للمزرعة.</p>
      </div>
      <ExpensesClientView initialExpenses={expenses} />
    </div>
  );
}
