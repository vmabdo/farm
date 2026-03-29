import prisma from '@/lib/prisma';
import MedicalClientView from '@/components/medical/MedicalClientView';

export const dynamic = 'force-dynamic';

export default async function MedicalPage() {
  const [medicines, records, cattle] = await Promise.all([
    prisma.medicine.findMany({ orderBy: { name: 'asc' } }),
    prisma.medicalRecord.findMany({ 
      include: { cattle: true, medicine: true },
      orderBy: { treatmentDate: 'desc' } 
    }),
    prisma.cattle.findMany({ 
      where: { status: 'ACTIVE' },
      orderBy: { tagNumber: 'asc' },
      select: { id: true, tagNumber: true, breed: { select: { name: true } } } // Fetching real active cattle
    }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">السجلات الطبية والتحصينات</h1>
          <p className="text-slate-500 mt-2">إدارة مخزون الأدوية وتتبع العلاجات الخاصة بالقطيع.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-slate-500 mb-1">أصناف الأدوية</span>
          <span className="text-2xl font-bold text-slate-800">{medicines.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-emerald-600 mb-1">المخزون الكلي (جرعة)</span>
          <span className="text-2xl font-bold text-emerald-700">{medicines.reduce((sum: number, med: any) => sum + med.currentStock, 0)}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-blue-600 mb-1">سجلات العلاج</span>
          <span className="text-2xl font-bold text-blue-700">{records.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex flex-col justify-center">
          <span className="text-sm font-medium text-rose-600 mb-1">حيوانات معالجة</span>
          <span className="text-2xl font-bold text-rose-700">{new Set(records.map((r: any) => r.cattleId)).size}</span>
        </div>
      </div>

      <MedicalClientView 
        initialMedicines={medicines}
        initialRecords={records}
        cattleData={cattle}
      />
    </div>
  );
}
