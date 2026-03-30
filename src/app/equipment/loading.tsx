export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 p-2 lg:p-8 mt-16 sm:mt-0">
      <div className="space-y-2">
        <div className="h-8 w-56 bg-slate-200 rounded-xl" />
        <div className="h-4 w-80 bg-slate-100 rounded-xl" />
      </div>

      <div className="flex justify-between items-center">
        <div className="h-10 w-full sm:max-w-xs bg-slate-100 rounded-xl" />
        <div className="h-10 w-36 bg-emerald-100 rounded-xl" />
      </div>

      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden">
        <div className="h-12 bg-slate-50 border-b border-slate-100" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 border-b border-slate-50 bg-white" />
        ))}
      </div>
    </div>
  );
}
