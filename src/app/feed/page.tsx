import prisma from '@/lib/prisma';
import FeedClientView from '@/components/feed/FeedClientView';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const [feedItems, feedOrders, feedConsumptions] = await Promise.all([
    prisma.feedItem.findMany({ orderBy: { name: 'asc' } }),
    prisma.feedOrder.findMany({ 
      include: { feedItem: true },
      orderBy: { orderDate: 'desc' } 
    }),
    prisma.feedConsumption.findMany({ 
      include: { feedItem: true },
      orderBy: { date: 'desc' } 
    }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Feed & Inventory</h1>
          <p className="text-slate-500 mt-2">Manage feed stock, track purchases, and log daily consumption.</p>
        </div>
      </header>

      <FeedClientView 
        initialItems={feedItems}
        initialOrders={feedOrders}
        initialConsumptions={feedConsumptions}
      />
    </div>
  );
}
