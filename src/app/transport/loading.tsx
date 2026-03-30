export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 p-2">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 rounded-xl" />
        <div className="h-4 w-72 bg-slate-100 rounded-xl" />
      </div>

      {/* Toolbar skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-32 bg-slate-100 rounded" />
        <div className="h-9 w-44 bg-blue-100 rounded-xl" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden">
        <div className="flex gap-4 px-8 py-5 border-b border-slate-100 bg-slate-50">
          {[18, 18, 18, 15, 15, 16].map((w, i) => (
            <div key={i} className="h-4 bg-slate-200 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-8 py-5 border-b border-slate-50">
            {[18, 18, 18, 15, 15, 16].map((w, j) => (
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
