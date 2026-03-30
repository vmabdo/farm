export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fade-out slide-out-to-bottom-4 ease-in-out">
      {children}
    </div>
  );
}
