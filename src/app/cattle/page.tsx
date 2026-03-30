import prisma from '@/lib/prisma';
import CattleClientView from '@/components/cattle/CattleClientView';

export const dynamic = 'force-dynamic';

export default async function CattlePage() {
  const [cattleData, breeds] = await Promise.all([
    prisma.cattle.findMany({
      include: {
        breed: true,
        weights: {
          orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        },
        _count: {
          select: { medical: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.breed.findMany({
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">إدارة القطيع</h1>
          <p className="text-slate-500 mt-2">تتبع الماشية وتفاصيل الدخول وتطور الأوزان.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-slate-500 mb-1">العدد الكلي</span>
          <span className="text-2xl font-bold text-slate-800">{cattleData.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-emerald-600 mb-1">نشط</span>
          <span className="text-2xl font-bold text-emerald-700">{cattleData.filter((c: any) => c.status === 'ACTIVE').length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-amber-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-amber-600 mb-1">مباع</span>
          <span className="text-2xl font-bold text-amber-700">{cattleData.filter((c: any) => c.status === 'SOLD').length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-rose-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-rose-600 mb-1">نافق</span>
          <span className="text-2xl font-bold text-rose-700">{cattleData.filter((c: any) => c.status === 'DECEASED').length}</span>
        </div>
      </div>

      <CattleClientView rawData={cattleData} breeds={breeds} />
    </div>
  );
}
