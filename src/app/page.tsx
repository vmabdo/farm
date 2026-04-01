import prisma from '@/lib/prisma';
import DashboardClientView from '@/components/dashboard/DashboardClientView';
import { subMonths, format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'لوحة القيادة | Farm ERP',
};

export default async function Home() {
  const [revenue, activeCattleCount, feedPurchased, feedConsumed, workerCount, invoices, cattleDistribution] = await Promise.all([
    // Total Revenue
    prisma.invoice.aggregate({ _sum: { netAmount: true } }),
    // Active Cattle Count
    prisma.cattle.count({ where: { status: 'ACTIVE' } }),
    // Total Feed Purchased (sum of all FeedPurchaseOrder quantities)
    prisma.feedPurchaseOrder.aggregate({ _sum: { quantity: true } }),
    // Total Feed Consumed (sum of all FeedConsumption quantities)
    prisma.feedConsumption.aggregate({ _sum: { quantity: true } }),
    // Total Workers
    prisma.worker.count({ where: { active: true } }),
    // Invoices for last 6 months (Sales Data)
    prisma.invoice.findMany({
      where: { invoiceDate: { gte: subMonths(new Date(), 6) } },
      select: { invoiceDate: true, netAmount: true, clientName: true, serialNumber: true }
    }),
    // Cattle Status Distribution
    prisma.cattle.groupBy({
      by: ['status'],
      _count: { status: true },
    })
  ]);

  // Calculate current feed stock: purchased minus consumed (gracefully handle nulls)
  const totalFeedStock = Math.max(
    0,
    (feedPurchased._sum.quantity ?? 0) - (feedConsumed._sum.quantity ?? 0)
  );

  // Transform Sales Data for Chart
  const salesMap = new Map();
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    salesMap.set(format(d, 'MMM yyyy', { locale: ar }), 0);
  }

  invoices.forEach((inv) => {
    const month = format(new Date(inv.invoiceDate), 'MMM yyyy', { locale: ar });
    if (salesMap.has(month)) {
      salesMap.set(month, salesMap.get(month) + inv.netAmount);
    }
  });

  const salesData = Array.from(salesMap.entries()).map(([month, total]) => ({ month, total }));

  // Transform Cattle Distribution for Pie Chart
  const distMap: Record<string, number> = { 'طبيعي (نشط)': 0, 'مباع': 0, 'نافق': 0 };
  cattleDistribution.forEach((c) => {
    if (c.status === 'ACTIVE') distMap['طبيعي (نشط)'] = c._count.status;
    else if (c.status === 'SOLD') distMap['مباع'] = c._count.status;
    else if (c.status === 'DECEASED') distMap['نافق'] = c._count.status;
  });
  
  const cattleDistData = Object.entries(distMap).map(([name, value]) => ({ name, value }));

  // Recent Activity Merge
  // Get latest 5 calves
  const recentCalves = await prisma.cattle.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { breed: true }
  });

  // Get recent 5 invoices (using already fetched ones or fetching again)
  const recentInvoicesRaw = await prisma.invoice.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Merge and sort
  const combined = [
    ...recentCalves.map(c => ({
      type: 'CATTLE',
      date: c.createdAt,
      title: 'تمت إضافة عجل جديد',
      subtitle: `رقم العجل: ${c.tagNumber} | السلالة: ${c.breed?.name || 'غير محدد'}`,
      amountStr: `${c.entryWeight} كجم`
    })),
    ...recentInvoicesRaw.map(inv => ({
      type: 'INVOICE',
      date: inv.createdAt,
      title: `تم إنشاء فاتورة #${inv.serialNumber}`,
      subtitle: `العميل: ${inv.clientName}`,
      amountStr: `${inv.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م`
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const dashboardData = {
    revenue: revenue._sum.netAmount ?? 0,
    activeCattleCount,
    totalFeedStock,
    workerCount,
    salesData,
    cattleDistribution: cattleDistData,
    recentActivity: combined
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto mt-16 sm:mt-0">
      <DashboardClientView data={dashboardData} />
    </div>
  );
}
