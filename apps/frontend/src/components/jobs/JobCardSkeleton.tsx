export const JobCardSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="animate-pulse space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-4 border rounded-lg shadow-sm">
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-blue-200/50 rounded w-3/4" />
          <div className="h-4 bg-blue-200/50 rounded w-1/2" />
          <div className="h-3 bg-blue-200/50 rounded w-1/3" />
          <div className="h-3 bg-blue-200/50 rounded w-1/4" />
        </div>
        <div className="mt-3 flex justify-end">
          <div className="h-4 bg-blue-200/50 rounded w-24" />
        </div>
      </div>
    ))}
  </div>
);
