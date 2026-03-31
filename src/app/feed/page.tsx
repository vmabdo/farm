import prisma from '@/lib/prisma';
import FeedClientView from '@/components/feed/FeedClientView';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const [feedItems, feedOrders, feedConsumptions] = await Promise.all([
    prisma.feedItem.findMany({ orderBy: { name: 'asc' } }),
    prisma.feedPurchaseOrder.findMany({ 
      include: { feedItem: true },
      orderBy: { date: 'desc' } 
    }),
    prisma.feedConsumption.findMany({ 
      include: { feedItem: true },
      orderBy: { date: 'desc' } 
    }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">الأعلاف والمخزون</h1>
          <p className="text-slate-500 mt-2">إدارة مخزون الأعلاف، تتبع المشتريات، وتسجيل الاستهلاك اليومي.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-slate-500 mb-1">أنواع الأعلاف</span>
          <span className="text-2xl font-bold text-slate-800">{feedItems.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-emerald-600 mb-1">طلبيات الشراء</span>
          <span className="text-2xl font-bold text-emerald-700">{feedOrders.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-blue-600 mb-1">سجلات الاستهلاك</span>
          <span className="text-2xl font-bold text-blue-700">{feedConsumptions.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-rose-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-rose-600 mb-1">تكلفة الطلبيات (ج.م)</span>
          <span className="text-2xl font-bold text-rose-700">{feedOrders.reduce((sum: number, order: any) => sum + (order.totalCost || 0), 0).toFixed(2)}</span>
        </div>
      </div>

      <FeedClientView 
        initialItems={feedItems}
        initialOrders={feedOrders}
        initialConsumptions={feedConsumptions}
      />
    </div>
  );
}
