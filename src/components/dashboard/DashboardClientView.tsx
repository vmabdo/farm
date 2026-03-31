'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { ChartLine, Wheat, Users, ShoppingCart, AlertTriangle, ArrowUpRight, PlusCircle, Receipt } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const COLORS = ['#10b981', '#f59e0b', '#f43f5e']; // Emerald, Amber, Rose

export default function DashboardClientView({ data }: { data: any }) {
  const {
    revenue,
    activeCattleCount,
    totalFeedStock,
    workerCount,
    salesData,
    cattleDistribution,
    recentActivity
  } = data;

  const isLowStock = totalFeedStock < 100; // warn when below 100 units

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">نظرة عامة</h1>
        <p className="text-slate-500 mt-2">لوحة التحكم السريعة والتحليلات البيانية</p>
      </header>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Revenue */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-xl p-3 bg-emerald-50 text-emerald-600">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">إجمالي الإيرادات</p>
              <div className="flex items-baseline gap-1 mt-1">
                <h3 className="text-2xl font-black text-slate-900">{revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                <span className="text-sm text-slate-500">ج.م</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Cattle */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-xl p-3 bg-indigo-50 text-indigo-600">
              <ChartLine className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">القطيع النشط</p>
              <div className="flex items-baseline gap-1 mt-1">
                <h3 className="text-2xl font-black text-slate-900">{activeCattleCount}</h3>
                <span className="text-sm text-slate-500">رأس</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Feed Stock */}
        <div className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border ${isLowStock ? 'border-amber-200' : 'border-slate-100'} hover:shadow-md transition-shadow`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl p-3 bg-amber-50 text-amber-600">
                <Wheat className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">مخزون الأعلاف</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <h3 className="text-2xl font-black text-slate-900">{totalFeedStock.toLocaleString('en-US', { maximumFractionDigits: 2 })}</h3>
                  <span className="text-sm text-slate-500">وحدة</span>
                </div>
              </div>
            </div>
            {isLowStock && (
              <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold">
                <AlertTriangle className="w-3 h-3" />
                مخزون منخفض
              </div>
            )}
          </div>
        </div>

        {/* Total Workers */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-xl p-3 bg-blue-50 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">العمالة النشطة</p>
              <div className="flex items-baseline gap-1 mt-1">
                <h3 className="text-2xl font-black text-slate-900">{workerCount}</h3>
                <span className="text-sm text-slate-500">عامل</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Sales/Revenue Bar Chart */}
        <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-500" />
            تطور المبيعات والإيرادات (أخر 6 أشهر)
          </h3>
          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `${value / 1000}k`} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${Number(value).toLocaleString()} ج.م`, 'المبيعات']}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cattle Status Donut Chart */}
        <div className="col-span-1 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">توزيع القطيع</h3>
          <div className="flex-1 min-h-[320px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cattleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {cattleDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any) => [`${value} رأس`, name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-slate-700 font-medium ms-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">أحدث النشاطات</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {recentActivity.map((activity: any, index: number) => (
            <div key={index} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${activity.type === 'INVOICE' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {activity.type === 'INVOICE' ? <Receipt className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{activity.title}</p>
                  <p className="text-sm text-slate-500">{activity.subtitle}</p>
                </div>
              </div>
              <div className="text-end">
                <p className="text-sm font-bold text-slate-700">{activity.amountStr}</p>
                <p className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: ar })}
                </p>
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div className="px-6 py-8 text-center text-slate-500">لا توجد نشاطات حديثة.</div>
          )}
        </div>
      </div>

    </div>
  );
}
