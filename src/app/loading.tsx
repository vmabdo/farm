export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 p-2">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 rounded-xl" />
        <div className="h-4 w-96 bg-slate-100 rounded-lg" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-100 rounded" />
                <div className="h-7 w-12 bg-slate-200 rounded" />
              </div>
              <div className="h-11 w-11 bg-slate-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table header */}
        <div className="flex gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50">
          {[40, 28, 20, 24, 20].map((w, i) => (
            <div key={i} className={`h-4 bg-slate-200 rounded`} style={{ width: `${w}%` }} />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-6 py-4 border-b border-slate-50">
            {[40, 28, 20, 24, 20].map((w, j) => (
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
