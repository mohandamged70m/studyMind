export default function LibraryLoading() {
  return (
    <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full flex flex-col md:flex-row gap-8 min-h-0">
      {/* Left skeleton */}
      <div className="w-full md:w-[350px] lg:w-[400px] shrink-0 flex flex-col gap-6 animate-pulse">
        <div className="space-y-3">
          <div className="h-8 bg-line rounded-lg w-1/2" />
          <div className="h-4 bg-line rounded-lg w-full" />
          <div className="h-4 bg-line rounded-lg w-5/6" />
        </div>
        <div className="h-56 bg-line rounded-2xl w-full" />
        <div className="h-32 bg-line rounded-2xl w-full" />
      </div>

      {/* Right skeleton */}
      <div className="flex-1 flex flex-col gap-4 animate-pulse">
        <div className="h-6 bg-line rounded-lg w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-line rounded-xl p-5 h-44 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-10 w-10 bg-line rounded-lg" />
                <div className="h-5 w-20 bg-line rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-line rounded w-3/4" />
                <div className="h-3 bg-line rounded w-1/2" />
              </div>
              <div className="h-1.5 bg-line rounded-full w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
