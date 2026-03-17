import prisma from '@/lib/prisma';
import CattleClientView from '@/components/cattle/CattleClientView';

export const dynamic = 'force-dynamic';

export default async function CattlePage() {
  const cattleData = await prisma.cattle.findMany({
    include: {
      weights: {
        orderBy: { date: 'desc' },
        take: 2, // We need latest 2 to calculate the immediate difference if needed
      },
      _count: {
        select: { medical: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Cattle Management</h1>
          <p className="text-slate-500 mt-2">Track livestock, entry details, and weight progression.</p>
        </div>
      </header>

      <CattleClientView rawData={cattleData} />
    </div>
  );
}
