'use client';

import { useState, useRef } from 'react';
import { Settings, ImagePlus, Trash2, Key, CheckCircle2, XCircle } from 'lucide-react';
import { saveFarmSettings, clearLogo } from '@/app/actions/settings';
import { changePassword } from '@/app/actions/auth';

type FarmSettings = { id: number; farmName: string; logoData: string | null };

// ─── Section card helper ────────────────────────────────────────────────────
function SectionCard({
  title,
  subtitle,
  icon,
  accentColor,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 overflow-hidden">
      <div className={`flex items-center gap-4 px-8 py-6 border-b border-slate-100 ${accentColor}`}>
        <div className="p-3 bg-white/80 rounded-2xl shadow-sm">{icon}</div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}

// ─── Status alert ──────────────────────────────────────────────────────────
function StatusAlert({ msg }: { msg: { text: string; type: string } | null }) {
  if (!msg?.text) return null;
  const ok = msg.type === 'success';
  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border mb-6
        ${ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}
    >
      {ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
      {msg.text}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function SettingsClientView({ initialSettings }: { initialSettings: FarmSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [previewLogo, setPreviewLogo] = useState<string | null>(initialSettings.logoData);
  const [farmMsg, setFarmMsg] = useState<{ text: string; type: string } | null>(null);
  const [pwMsg, setPwMsg]   = useState<{ text: string; type: string } | null>(null);
  const [farmLoading, setFarmLoading] = useState(false);
  const [pwLoading, setPwLoading]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Convert selected file → base64 string and preview it
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 2MB.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPreviewLogo(result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveFarm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFarmLoading(true);
    setFarmMsg(null);

    const fd = new FormData(e.currentTarget);
    // Inject the base64 logo string instead of the raw file
    fd.delete('logoFile'); // remove file input — not serialisable
    if (previewLogo) fd.set('logoData', previewLogo);

    const res = await saveFarmSettings(fd);
    setFarmLoading(false);
    if (res.success) {
      setFarmMsg({ text: 'تم حفظ إعدادات المزرعة بنجاح.', type: 'success' });
      setSettings((s) => ({ ...s, farmName: fd.get('farmName') as string, logoData: previewLogo }));
    } else {
      setFarmMsg({ text: res.error || 'حدث خطأ.', type: 'error' });
    }
  }

  async function handleClearLogo() {
    const res = await clearLogo();
    if (res.success) {
      setPreviewLogo(null);
      setSettings((s) => ({ ...s, logoData: null }));
      if (fileRef.current) fileRef.current.value = '';
    } else {
      alert(res.error);
    }
  }

  async function handleSavePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwLoading(true);
    setPwMsg(null);
    const fd = new FormData(e.currentTarget);
    const newPw = fd.get('newPassword') as string;
    const confirm = fd.get('confirmPassword') as string;
    if (newPw !== confirm) {
      setPwMsg({ text: 'كلمتا المرور غير متطابقتين.', type: 'error' });
      setPwLoading(false);
      return;
    }
    const res = await changePassword(fd);
    setPwLoading(false);
    if (res.success) {
      setPwMsg({ text: 'تم تحديث كلمة المرور بنجاح.', type: 'success' });
      (e.target as HTMLFormElement).reset();
    } else {
      setPwMsg({ text: res.error || 'فشل التحديث.', type: 'error' });
    }
  }

  return (
    <div className="space-y-8">

      {/* ── Farm Identity ───────────────────────────────────────────── */}
      <SectionCard
        title="هوية المزرعة"
        subtitle="اسم المزرعة وشعارها — يظهران على الفواتير والتقارير."
        icon={<Settings className="w-6 h-6 text-emerald-600" />}
        accentColor="bg-emerald-50/60"
      >
        <StatusAlert msg={farmMsg} />
        <form onSubmit={handleSaveFarm} className="space-y-6">

          {/* Farm name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">اسم المزرعة *</label>
            <input
              name="farmName"
              required
              defaultValue={settings.farmName}
              placeholder="مثال: مزرعة الجزيرة للتسمين"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-slate-900"
            />
          </div>

          {/* Logo upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">شعار المزرعة (اختياري)</label>
            <p className="text-xs text-slate-400 mb-3">PNG أو JPG، الحد الأقصى 2MB. سيُحوَّل إلى Base64 ويُخزَّن في قاعدة البيانات.</p>

            {/* Preview area */}
            <div className="flex items-start gap-6">
              <div
                className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center
                           bg-slate-50 overflow-hidden shrink-0 shadow-inner cursor-pointer hover:border-emerald-400 transition"
                onClick={() => fileRef.current?.click()}
              >
                {previewLogo ? (
                  <img src={previewLogo} alt="شعار" className="w-full h-full object-contain p-1" />
                ) : (
                  <ImagePlus className="w-8 h-8 text-slate-300" />
                )}
              </div>

              <div className="flex flex-col gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl
                             transition text-sm flex items-center gap-2"
                >
                  <ImagePlus className="w-4 h-4" />
                  {previewLogo ? 'تغيير الشعار' : 'رفع شعار'}
                </button>
                {previewLogo && (
                  <button
                    type="button"
                    onClick={handleClearLogo}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium rounded-xl
                               transition text-sm flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    مسح الشعار
                  </button>
                )}
                {/* Hidden file input */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  name="logoFile"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={farmLoading}
              className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20
                         hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {farmLoading ? 'جاري الحفظ...' : 'حفظ إعدادات المزرعة'}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* ── Change Password ─────────────────────────────────────────── */}
      <SectionCard
        title="تغيير كلمة المرور"
        subtitle="تحديث بيانات الدخول للنظام."
        icon={<Key className="w-6 h-6 text-blue-600" />}
        accentColor="bg-blue-50/60"
      >
        <StatusAlert msg={pwMsg} />
        <form onSubmit={handleSavePassword} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">اسم المستخدم</label>
            <input
              name="username"
              type="text"
              defaultValue="admin"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">كلمة المرور الحالية *</label>
            <input
              name="currentPassword"
              type="password"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div className="border-t border-slate-100 pt-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">كلمة المرور الجديدة *</label>
            <input
              name="newPassword"
              type="password"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">تأكيد كلمة المرور الجديدة *</label>
            <input
              name="confirmPassword"
              type="password"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={pwLoading}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20
                         hover:bg-blue-700 transition disabled:opacity-50"
            >
              {pwLoading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
