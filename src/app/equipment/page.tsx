import prisma from '@/lib/prisma';
import EquipmentClientView from '@/components/equipment/EquipmentClientView';

export const metadata = {
  title: 'المعدات والآلات | Farm ERP',
};

export default async function EquipmentPage() {
  const equipment = await prisma.equipment.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto mt-16 sm:mt-0">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">المعدات والآلات</h1>
        <p className="text-slate-500 mt-2">إدارة الجرارات، اللوادر، والمولدات وتتبع حالة الصيانة وحالتها.</p>
      </div>

      <EquipmentClientView initialEquipment={equipment} />
    </div>
  );
}
