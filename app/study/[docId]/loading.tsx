export default function StudyLoading() {
  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden animate-pulse">
      {/* Left section: PDF Viewer Skeleton */}
      <div className="flex-1 bg-paper px-12 py-8 overflow-y-auto flex flex-col items-center gap-12 border-r border-line">
        <div className="w-full max-w-3xl flex justify-between items-center border-b border-line pb-4 mb-2">
          <div className="h-6 bg-line rounded w-1/3" />
          <div className="h-6 bg-line rounded w-16" />
        </div>
        <div className="bg-card border border-line rounded-xl p-10 h-[600px] w-full max-w-3xl flex flex-col gap-6">
          <div className="h-8 bg-line rounded w-1/4 self-end" />
          <div className="h-6 bg-line rounded w-3/4" />
          <div className="space-y-3">
            <div className="h-4 bg-line rounded w-full" />
            <div className="h-4 bg-line rounded w-full" />
            <div className="h-4 bg-line rounded w-full" />
            <div className="h-4 bg-line rounded w-5/6" />
          </div>
          <div className="space-y-3 mt-6">
            <div className="h-4 bg-line rounded w-full" />
            <div className="h-4 bg-line rounded w-full" />
            <div className="h-4 bg-line rounded w-2/3" />
          </div>
        </div>
      </div>

      {/* Right section: Sidebar Skeleton */}
      <div className="w-full md:w-[420px] lg:w-[480px] shrink-0 bg-paper-deep border-l border-line flex flex-col">
        <div className="flex border-b border-line bg-card h-12">
          <div className="flex-1 border-r border-line flex items-center justify-center">
            <div className="h-4 bg-line rounded w-1/3" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="h-4 bg-line rounded w-1/3" />
          </div>
        </div>
        <div className="flex-1 p-5 flex flex-col gap-4">
          <div className="h-44 bg-card border border-line rounded-xl p-4 flex flex-col justify-between">
            <div className="h-4 bg-line rounded w-1/2" />
            <div className="h-3 bg-line rounded w-3/4" />
            <div className="h-8 bg-line rounded w-full" />
          </div>
          <div className="h-44 bg-card border border-line rounded-xl p-4 flex flex-col justify-between">
            <div className="h-4 bg-line rounded w-1/2" />
            <div className="h-3 bg-line rounded w-3/4" />
            <div className="h-8 bg-line rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
