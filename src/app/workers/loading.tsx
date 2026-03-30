export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 p-2">
      <div className="space-y-2">
        <div className="h-8 w-60 bg-slate-200 rounded-xl" />
        <div className="h-4 w-80 bg-slate-100 rounded-xl" />
      </div>

      {/* Tab bar skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 bg-slate-200/50 p-1 rounded-xl">
          <div className="h-9 w-32 bg-white rounded-xl shadow-sm" />
          <div className="h-9 w-28 bg-transparent rounded-xl" />
        </div>
        <div className="h-9 w-36 bg-slate-200 rounded-xl" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden">
        <div className="flex gap-4 px-8 py-5 border-b border-slate-100 bg-slate-50">
          {[25, 18, 15, 15, 12, 15].map((w, i) => (
            <div key={i} className="h-4 bg-slate-200 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-8 py-5 border-b border-slate-50">
            {[25, 18, 15, 15, 12, 15].map((w, j) => (
              <div
                key={j}
                className="h-4 bg-slate-100 rounded"
                style={{ width: `${w}%`, opacity: 1 - i * 0.08 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
