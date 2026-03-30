import prisma from '@/lib/prisma';
import TransportClientView from '@/components/transport/TransportClientView';

export const dynamic = 'force-dynamic';

export default async function TransportPage() {
  const transports = await prisma.transportRent.findMany({
    orderBy: { travelDate: 'desc' }
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">النقل والمواصلات</h1>
          <p className="text-slate-500 mt-2">تسجيل مركبات التوصيل، نقل الأعلاف، ومصاريف النقل الداخلي.</p>
        </div>
      </header>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-slate-500 mb-1">إجمالي الرحلات</span>
          <span className="text-2xl font-bold text-slate-800">{transports.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-emerald-600 mb-1">حمولة أعلاف</span>
          <span className="text-2xl font-bold text-emerald-700">{transports.filter(t => t.purpose === 'FEED_DELIVERY').length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-amber-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-amber-600 mb-1">نقل مواشي</span>
          <span className="text-2xl font-bold text-amber-700">{transports.filter(t => t.purpose === 'CATTLE_TRANSPORT').length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-rose-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-rose-600 mb-1">إجمالي التكلفة (ج.م)</span>
          <span className="text-2xl font-bold text-rose-700">{transports.reduce((sum, t) => sum + t.cost, 0).toFixed(2)}</span>
        </div>
      </div>

      <TransportClientView initialTransports={transports} />
    </div>
  );
}
