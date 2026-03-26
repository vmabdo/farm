import prisma from '@/lib/prisma';
import TransportClientView from '@/components/transport/TransportClientView';

export const dynamic = 'force-dynamic';

export default async function TransportPage() {
  const transports = await prisma.transportRent.findMany({
    orderBy: { travelDate: 'desc' }
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">النقل والمواصلات</h1>
          <p className="text-slate-500 mt-2">تسجيل مركبات التوصيل، نقل الأعلاف، ومصاريف النقل الداخلي.</p>
        </div>
      </header>

      <TransportClientView initialTransports={transports} />
    </div>
  );
}
