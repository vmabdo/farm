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
      select: { id: true, tagNumber: true, breed: true } // Fetching real active cattle
    }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">السجلات الطبية والتحصينات</h1>
          <p className="text-slate-500 mt-2">إدارة مخزون الأدوية وتتبع العلاجات الخاصة بالقطيع.</p>
        </div>
      </header>

      <MedicalClientView 
        initialMedicines={medicines}
        initialRecords={records}
        cattleData={cattle}
      />
    </div>
  );
}
