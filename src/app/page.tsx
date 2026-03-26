import { ChartLine, Wheat, Users, Syringe, Truck } from 'lucide-react';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [cattleCount, activeWorkers, transportCount] = await Promise.all([
    prisma.cattle.count({ where: { status: 'ACTIVE' } }),
    prisma.worker.count({ where: { active: true } }),
    prisma.transportRent.count(),
  ]);

  // Aggregate feed stock (sum of currentStock)
  const feedItems = await prisma.feedItem.findMany();
  const feedStock = feedItems.reduce((acc: number, item: any) => acc + item.currentStock, 0);

  // Medical needs could be based on something logic-wise, just counting all records for now
  const pendingMedical = await prisma.medicalRecord.count();

  const stats = [
    { name: 'إجمالي القطيع', value: cattleCount.toString(), icon: ChartLine, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { name: 'مواد العلف', value: feedStock.toString(), icon: Wheat, color: 'text-amber-500', bg: 'bg-amber-100' },
    { name: 'العمال النشطين', value: activeWorkers.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
    { name: 'السجلات الطبية', value: pendingMedical.toString(), icon: Syringe, color: 'text-rose-500', bg: 'bg-rose-100' },
    { name: 'عمليات النقل', value: transportCount.toString(), icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  ];

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">نظرة عامة</h1>
        <p className="text-slate-500 mt-2">مرحباً بك في نظام إدارة المزرعة المتكامل</p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.name} className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <dt>
              <div className={`absolute rounded-xl p-3 ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
              </div>
              <p className="ms-16 truncate text-sm font-medium text-slate-500">{stat.name}</p>
            </dt>
            <dd className="ms-16 flex items-baseline pb-1">
              <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
            </dd>
          </div>
        ))}
      </div>

    </div>
  );
}
