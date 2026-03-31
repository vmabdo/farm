'use client';

import { useState, useEffect } from 'react';
import {
  ChartLine, Wheat, Users, RefreshCw, AlertCircle,
  ShoppingCart, TrendingUp, TrendingDown, Minus,
  Printer, Truck, Wrench, Syringe,
} from 'lucide-react';
import { getReportData } from '@/app/actions/reports';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

type ReportData = Awaited<ReturnType<typeof getReportData>>;

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Reusable detail-table wrapper
function DetailTable({ title, icon, color, children }: {
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md print:break-inside-avoid">
      <div className={`px-6 py-4 border-b border-slate-200 flex items-center gap-2 ${color}`}>
        {icon}
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function ReportsClientView() {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    if (startDate && endDate) {
      getReportData(startDate, endDate)
        .then((res) => { if (active) { setData(res); setIsLoading(false); } })
        .catch(() => { if (active) { setError('حدث خطأ أثناء تحميل التقرير.'); setIsLoading(false); } });
    }
    return () => { active = false; };
  }, [startDate, endDate]);

  const isProfit = data ? data.pnl.netProfit > 0 : false;
  const isLoss   = data ? data.pnl.netProfit < 0 : false;

  return (
    <div className="space-y-6 print:space-y-4">

      {/* ── Controls bar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center
                      bg-white p-4 rounded-2xl shadow-md border border-slate-200
                      print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-slate-600">الفترة الزمنية:</span>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-700">من:</label>
            <input type="date" value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-700">إلى:</label>
            <input type="date" value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white
                     font-bold rounded-xl hover:bg-slate-900 transition shadow-md"
        >
          <Printer className="w-4 h-4" />
          طباعة التقرير
        </button>
      </div>

      {/* ── Print header (only visible when printing) ─────────────────── */}
      <div className="hidden print:block border-b-2 border-slate-300 pb-4 mb-4">
        <h2 className="text-2xl font-black text-slate-900">تقرير المزرعة الشامل</h2>
        <p className="text-slate-600 text-sm mt-1">
          الفترة: {startDate} — {endDate}
        </p>
      </div>

      {/* ── Loading / Error states ────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-2xl
                        shadow-md border border-slate-200">
          <RefreshCw className="w-9 h-9 text-emerald-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-rose-50
                        text-rose-500 rounded-2xl border border-rose-200 gap-2">
          <AlertCircle className="w-8 h-8" />
          <p className="font-semibold">{error}</p>
        </div>
      ) : data ? (
        <div className="space-y-6 print:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500
                        print:animate-none">

          {/* ══ NET PROFIT / LOSS HERO CARD ══════════════════════════════ */}
          <div className={`rounded-2xl p-6 border-2 shadow-md print:break-inside-avoid
            ${isProfit ? 'bg-emerald-50 border-emerald-300'
              : isLoss  ? 'bg-rose-50 border-rose-300'
              : 'bg-slate-50 border-slate-300'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-1">
                  صافي الأرباح والخسائر
                </p>
                <div className={`text-5xl font-black ${isProfit ? 'text-emerald-600' : isLoss ? 'text-rose-600' : 'text-slate-700'}`}>
                  {isProfit ? '+' : ''}{fmt(data.pnl.netProfit)}
                  <span className="text-xl font-semibold ms-2 opacity-70">ج.م</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  الفترة: {format(new Date(startDate), 'd MMM yyyy', { locale: ar })}
                  &nbsp;—&nbsp;
                  {format(new Date(endDate), 'd MMM yyyy', { locale: ar })}
                </p>
              </div>
              <div className={`p-5 rounded-2xl ${isProfit ? 'bg-emerald-100' : isLoss ? 'bg-rose-100' : 'bg-slate-100'}`}>
                {isProfit ? <TrendingUp  className="w-12 h-12 text-emerald-500" />
                : isLoss   ? <TrendingDown className="w-12 h-12 text-rose-500" />
                :             <Minus       className="w-12 h-12 text-slate-400" />}
              </div>
            </div>

            {/* Mini breakdown — 6 items */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
              {[
                { label: 'الإيرادات (صافي)',           value: data.pnl.totalRevenue,      color: 'text-emerald-700', bg: 'bg-emerald-100/70' },
                { label: 'تكلفة طلبيات الأعلاف',       value: data.pnl.feedCost,          color: 'text-amber-700',   bg: 'bg-amber-100/70'   },
                { label: 'تكلفة طلبيات الأدوية',       value: data.pnl.medicalCost,       color: 'text-purple-700',  bg: 'bg-purple-100/70'  },
                { label: 'مصروفات صيانة المعدات',      value: data.pnl.maintenanceCost,   color: 'text-orange-700',  bg: 'bg-orange-100/70'  },
                { label: 'تكاليف العمالة',              value: data.pnl.workerCost,        color: 'text-blue-700',    bg: 'bg-blue-100/70'    },
                { label: 'مصروفات النقل',              value: data.pnl.transportCost,    color: 'text-cyan-700',    bg: 'bg-cyan-100/70'    },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} rounded-xl p-3`}>
                  <p className="text-xs text-slate-500 font-medium leading-tight">{item.label}</p>
                  <p className={`font-black text-base mt-0.5 ${item.color}`}>
                    {fmt(item.value)} ج.م
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ══ SUMMARY CARDS ROW ════════════════════════════════════════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3">

            {/* Cattle */}
            <div className="bg-white p-5 rounded-2xl shadow-md border border-indigo-100
                            flex flex-col gap-3 print:break-inside-avoid">
              <div className="flex items-center gap-2 text-indigo-600">
                <ChartLine className="w-5 h-5" />
                <h3 className="font-bold text-sm">حركة القطيع</h3>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center text-xs">
                <div className="bg-emerald-50 text-emerald-700 py-2 rounded-xl font-bold">
                  <div>جديد</div><div className="text-lg mt-0.5">{data.cattle.new}</div>
                </div>
                <div className="bg-amber-50 text-amber-700 py-2 rounded-xl font-bold">
                  <div>مباع</div><div className="text-lg mt-0.5">{data.cattle.sold}</div>
                </div>
                <div className="bg-rose-50 text-rose-700 py-2 rounded-xl font-bold">
                  <div>نافق</div><div className="text-lg mt-0.5">{data.cattle.deceased}</div>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white p-5 rounded-2xl shadow-md border border-emerald-100
                            flex flex-col gap-2 print:break-inside-avoid">
              <div className="flex items-center gap-2 text-emerald-600">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-bold text-sm">صافي المبيعات</h3>
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-auto">
                {fmt(data.pnl.totalRevenue)}
                <span className="text-sm font-normal ms-1 text-emerald-600">ج.م</span>
              </div>
              <p className="text-xs text-slate-400">الإجمالي قبل الخصم: {fmt(data.pnl.totalGrossRevenue)} ج.م</p>
            </div>

            {/* Total Expenses */}
            <div className="bg-white p-5 rounded-2xl shadow-md border border-rose-100
                            flex flex-col gap-2 print:break-inside-avoid">
              <div className="flex items-center gap-2 text-rose-600">
                <TrendingDown className="w-5 h-5" />
                <h3 className="font-bold text-sm">إجمالي المصاريف</h3>
              </div>
              <div className="text-2xl font-black text-rose-700 mt-auto">
                {fmt(data.pnl.totalExpenses)}
                <span className="text-sm font-normal ms-1 text-rose-500">ج.م</span>
              </div>
              <p className="text-xs text-slate-400">أعلاف + أدوية + صيانة + رواتب + نقل</p>
            </div>

            {/* Workers */}
            <div className="bg-white p-5 rounded-2xl shadow-md border border-blue-100
                            flex flex-col gap-2 print:break-inside-avoid">
              <div className="flex items-center gap-2 text-blue-600">
                <Users className="w-5 h-5" />
                <h3 className="font-bold text-sm">الرواتب المنصرفة</h3>
              </div>
              <div className="text-2xl font-black text-blue-700 mt-auto">
                {fmt(data.payroll.total)}
                <span className="text-sm font-normal ms-1 text-blue-500">ج.م</span>
              </div>
              <p className="text-xs text-slate-400">مصروفات العمال للفترة</p>
            </div>
          </div>

          {/* ══ DETAIL TABLES GRID ═══════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">

            {/* ── P&L Breakdown table ──────────────────────────────────── */}
            <DetailTable
              title="ملخص الأرباح والخسائر"
              icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
              color="bg-slate-50"
            >
              <table className="w-full text-sm">
                <thead className="text-slate-500 bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-3 font-medium text-start">البيان</th>
                    <th className="px-6 py-3 font-medium text-end">القيمة (ج.م)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-emerald-700">إجمالي الإيرادات (صافي)</td>
                    <td className="px-6 py-4 text-end font-bold text-emerald-700">+ {fmt(data.pnl.totalRevenue)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-amber-700">تكلفة طلبيات الأعلاف</td>
                    <td className="px-6 py-4 text-end font-bold text-amber-700">({fmt(data.pnl.feedCost)})</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-purple-700">تكلفة طلبيات الأدوية</td>
                    <td className="px-6 py-4 text-end font-bold text-purple-700">({fmt(data.pnl.medicalCost)})</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-orange-700">مصروفات صيانة المعدات</td>
                    <td className="px-6 py-4 text-end font-bold text-orange-700">({fmt(data.pnl.maintenanceCost)})</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-blue-700">تكلفة رواتب العمال</td>
                    <td className="px-6 py-4 text-end font-bold text-blue-700">({fmt(data.pnl.workerCost)})</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-cyan-700">مصروفات النقل</td>
                    <td className="px-6 py-4 text-end font-bold text-cyan-700">({fmt(data.pnl.transportCost)})</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-slate-50/80">
                    <td className="px-6 py-4 font-semibold text-rose-700">إجمالي المصاريف</td>
                    <td className="px-6 py-4 text-end font-bold text-rose-700">({fmt(data.pnl.totalExpenses)})</td>
                  </tr>
                  <tr className={`border-t-2 ${isProfit ? 'bg-emerald-50 border-emerald-200' : isLoss ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                    <td className={`px-6 py-4 font-black text-base ${isProfit ? 'text-emerald-700' : isLoss ? 'text-rose-700' : 'text-slate-700'}`}>
                      صافي الأرباح / الخسائر
                    </td>
                    <td className={`px-6 py-4 text-end font-black text-base ${isProfit ? 'text-emerald-700' : isLoss ? 'text-rose-700' : 'text-slate-700'}`}>
                      {isProfit ? '+' : ''}{fmt(data.pnl.netProfit)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </DetailTable>

            {/* ── Cattle movement table ─────────────────────────────────── */}
            <DetailTable
              title="تفاصيل حركة القطيع"
              icon={<ChartLine className="w-4 h-4 text-indigo-600" />}
              color="bg-slate-50"
            >
              <table className="w-full text-sm">
                <thead className="text-slate-500 bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-3 font-medium text-start">الحالة</th>
                    <th className="px-6 py-3 font-medium text-end">العدد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { label: 'جديد (تم إدخاله)', value: data.cattle.new,      cls: 'text-emerald-700 bg-emerald-50/30' },
                    { label: 'مباع',              value: data.cattle.sold,     cls: 'text-amber-700  bg-amber-50/30'   },
                    { label: 'نافق',              value: data.cattle.deceased, cls: 'text-rose-700   bg-rose-50/30'    },
                  ].map((row) => (
                    <tr key={row.label} className="hover:bg-slate-50">
                      <td className={`px-6 py-4 font-semibold ${row.cls}`}>{row.label}</td>
                      <td className="px-6 py-4 text-end font-bold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DetailTable>

            {/* ── Feed Purchase Orders detail ───────────────────────────── */}
            <DetailTable
              title="تفاصيل طلبيات شراء الأعلاف"
              icon={<Wheat className="w-4 h-4 text-amber-600" />}
              color="bg-amber-50/50"
            >
              <table className="w-full text-sm">
                <thead className="text-slate-500 bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-3 font-medium text-start">نوع العلف</th>
                    <th className="px-6 py-3 font-medium text-start">التاريخ</th>
                    <th className="px-6 py-3 font-medium text-end">الكمية</th>
                    <th className="px-6 py-3 font-medium text-end">التكلفة (ج.م)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.feedOrders.length > 0 ? data.feedOrders.map((o: any, i: number) => (
                    <tr key={i} className="hover:bg-amber-50/20">
                      <td className="px-6 py-4 font-semibold text-slate-800">{o.feedItem?.name}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(o.date).toLocaleDateString('ar-EG')}</td>
                      <td className="px-6 py-4 text-end">
                        <span className="font-mono bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg text-xs">
                          {o.quantity.toLocaleString()} {o.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-end font-bold text-amber-700">{fmt(o.totalCost)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">لا توجد طلبيات أعلاف في هذه الفترة</td></tr>
                  )}
                  {data.feedOrders.length > 0 && (
                    <tr className="bg-amber-50/50 font-bold">
                      <td className="px-6 py-3 text-amber-800" colSpan={3}>إجمالي تكلفة طلبيات الأعلاف</td>
                      <td className="px-6 py-3 text-end text-amber-700">{fmt(data.pnl.feedCost)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </DetailTable>

            {/* ── Medical Purchase Orders detail ────────────────────────── */}
            <DetailTable
              title="تفاصيل طلبيات شراء الأدوية"
              icon={<Syringe className="w-4 h-4 text-purple-600" />}
              color="bg-purple-50/50"
            >
              <table className="w-full text-sm">
                <thead className="text-slate-500 bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-3 font-medium text-start">الدواء</th>
                    <th className="px-6 py-3 font-medium text-start">التاريخ</th>
                    <th className="px-6 py-3 font-medium text-end">الكمية</th>
                    <th className="px-6 py-3 font-medium text-end">التكلفة (ج.م)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.medicalOrders.length > 0 ? data.medicalOrders.map((o: any, i: number) => (
                    <tr key={i} className="hover:bg-purple-50/20">
                      <td className="px-6 py-4 font-semibold text-slate-800">{o.medicine?.name}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(o.date).toLocaleDateString('ar-EG')}</td>
                      <td className="px-6 py-4 text-end">
                        <span className="font-mono bg-purple-50 text-purple-800 px-2 py-0.5 rounded-lg text-xs">
                          {o.quantity.toLocaleString()} {o.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-end font-bold text-purple-700">{fmt(o.totalCost)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">لا توجد طلبيات أدوية في هذه الفترة</td></tr>
                  )}
                  {data.medicalOrders.length > 0 && (
                    <tr className="bg-purple-50/50 font-bold">
                      <td className="px-6 py-3 text-purple-800" colSpan={3}>إجمالي تكلفة طلبيات الأدوية</td>
                      <td className="px-6 py-3 text-end text-purple-700">{fmt(data.pnl.medicalCost)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </DetailTable>

            {/* ── Equipment Maintenance detail ──────────────────────────── */}
            <DetailTable
              title="تفاصيل مصروفات صيانة المعدات"
              icon={<Wrench className="w-4 h-4 text-orange-600" />}
              color="bg-orange-50/50"
            >
              <table className="w-full text-sm">
                <thead className="text-slate-500 bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-3 font-medium text-start">المعدة</th>
                    <th className="px-6 py-3 font-medium text-start">التاريخ</th>
                    <th className="px-6 py-3 font-medium text-start">الوصف</th>
                    <th className="px-6 py-3 font-medium text-end">التكلفة (ج.م)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.maintenanceRecords.length > 0 ? data.maintenanceRecords.map((m: any, i: number) => (
                    <tr key={i} className="hover:bg-orange-50/20">
                      <td className="px-6 py-4 font-semibold text-slate-800">{m.equipment?.name}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(m.date).toLocaleDateString('ar-EG')}</td>
                      <td className="px-6 py-4 text-slate-600 max-w-[160px] truncate">{m.description}</td>
                      <td className="px-6 py-4 text-end font-bold text-orange-700">
                        {m.cost > 0 ? fmt(m.cost) : '-'}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">لا توجد سجلات صيانة في هذه الفترة</td></tr>
                  )}
                  {data.maintenanceRecords.length > 0 && (
                    <tr className="bg-orange-50/50 font-bold">
                      <td className="px-6 py-3 text-orange-800" colSpan={3}>إجمالي مصروفات الصيانة</td>
                      <td className="px-6 py-3 text-end text-orange-700">{fmt(data.pnl.maintenanceCost)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </DetailTable>

            {/* ── Payroll detail ────────────────────────────────────────── */}
            <DetailTable
              title="تفاصيل صرف الرواتب"
              icon={<Users className="w-4 h-4 text-blue-600" />}
              color="bg-blue-50/50"
            >
              <table className="w-full text-sm">
                <thead className="text-slate-500 bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-3 font-medium text-start">العامل</th>
                    <th className="px-6 py-3 font-medium text-start">التاريخ</th>
                    <th className="px-6 py-3 font-medium text-end">المبلغ (ج.م)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.payroll.details.length > 0 ? data.payroll.details.map((p: any, i: number) => (
                    <tr key={i} className="hover:bg-blue-50/20">
                      <td className="px-6 py-4 font-semibold text-slate-800">{p.worker.name}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(p.paymentDate).toLocaleDateString('ar-EG')}</td>
                      <td className="px-6 py-4 text-end font-bold text-blue-700">{fmt(p.amount)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">لا توجد سجلات رواتب</td></tr>
                  )}
                  {data.payroll.details.length > 0 && (
                    <tr className="bg-blue-50/50 font-bold">
                      <td className="px-6 py-3 text-blue-800" colSpan={2}>الإجمالي</td>
                      <td className="px-6 py-3 text-end text-blue-700">{fmt(data.payroll.total)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </DetailTable>

            {/* ── Transport detail ──────────────────────────────────────── */}
            <DetailTable
              title="تفاصيل مصروفات النقل"
              icon={<Truck className="w-4 h-4 text-cyan-600" />}
              color="bg-cyan-50/50"
            >
              <table className="w-full text-sm">
                <thead className="text-slate-500 bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-3 font-medium text-start">التاريخ</th>
                    <th className="px-6 py-3 font-medium text-start">السائق / الغرض</th>
                    <th className="px-6 py-3 font-medium text-end">التكلفة (ج.م)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.transport.details.length > 0 ? data.transport.details.map((t: any, i: number) => (
                    <tr key={i} className="hover:bg-cyan-50/20">
                      <td className="px-6 py-4 text-slate-500">{new Date(t.travelDate).toLocaleDateString('ar-EG')}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {t.driverName ? `${t.driverName} • ` : ''}{t.purpose}
                      </td>
                      <td className="px-6 py-4 text-end font-bold text-cyan-700">{fmt(t.cost)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">لا توجد سجلات نقل</td></tr>
                  )}
                  {data.transport.details.length > 0 && (
                    <tr className="bg-cyan-50/50 font-bold">
                      <td className="px-6 py-3 text-cyan-800" colSpan={2}>الإجمالي</td>
                      <td className="px-6 py-3 text-end text-cyan-700">{fmt(data.transport.total)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </DetailTable>

          </div>{/* /detail grid */}
        </div>
      ) : null}
    </div>
  );
}
