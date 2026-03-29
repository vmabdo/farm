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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-slate-500 mb-1">إجمالي المعدات</span>
          <span className="text-2xl font-bold text-slate-800">{equipment.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-emerald-600 mb-1">تعمل بحالة جيدة</span>
          <span className="text-2xl font-bold text-emerald-700">{equipment.filter(e => e.status === 'ACTIVE').length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-amber-600 mb-1">في الصيانة</span>
          <span className="text-2xl font-bold text-amber-700">{equipment.filter(e => e.status === 'MAINTENANCE').length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-rose-600 mb-1">خارج الخدمة</span>
          <span className="text-2xl font-bold text-rose-700">{equipment.filter(e => e.status === 'OUT_OF_SERVICE').length}</span>
        </div>
      </div>

      <EquipmentClientView initialEquipment={equipment} />
    </div>
  );
}
