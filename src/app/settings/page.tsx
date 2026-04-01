import prisma from '@/lib/prisma';
import SettingsClientView from '@/components/settings/SettingsClientView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'الإعدادات | Farm ERP',
};

export default async function SettingsPage() {
  const farmSettings = await prisma.farmSettings.findUnique({ where: { id: 1 } })
    ?? { id: 1, farmName: 'مزرعتي', logoData: null };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto mt-16 sm:mt-0">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">الإعدادات</h1>
        <p className="text-slate-500 mt-2">إدارة بيانات المزرعة وهوية العلامة التجارية وكلمة المرور.</p>
      </div>
      <SettingsClientView initialSettings={farmSettings} />
    </div>
  );
}
