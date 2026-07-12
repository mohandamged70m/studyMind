export default function ReviewLoading() {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-6 py-10 w-full flex flex-col items-center gap-8 min-h-0 animate-pulse">
      {/* Header Skeleton */}
      <div className="w-full flex flex-col items-center text-center gap-3">
        <div className="h-4 bg-line rounded w-24" />
        <div className="h-8 bg-line rounded w-1/2" />
        <div className="h-4 bg-line rounded w-2/3" />
        <div className="h-10 bg-line rounded w-60 mt-4" />
      </div>

      {/* Main Card Skeleton */}
      <div className="w-full max-w-xl bg-card border border-line rounded-2xl p-8 h-80 flex flex-col justify-between mt-4">
        <div className="h-4 bg-line rounded w-20" />
        <div className="h-8 bg-line rounded w-3/4 mx-auto" />
        <div className="flex justify-between items-center">
          <div className="h-8 bg-line rounded w-32" />
          <div className="h-4 bg-line rounded w-16" />
        </div>
      </div>

      {/* Nav Controls Skeleton */}
      <div className="flex gap-4 items-center mt-2">
        <div className="h-11 w-11 bg-line rounded-xl" />
        <div className="h-10 bg-line rounded-xl w-32" />
        <div className="h-11 w-11 bg-line rounded-xl" />
      </div>
    </div>
  );
}
