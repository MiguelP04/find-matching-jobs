export const MatchCardSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="animate-pulse space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-4 border rounded-lg shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-blue-200/50 rounded w-3/4" />
            <div className="h-4 bg-blue-200/50 rounded w-1/2" />
            <div className="h-3 bg-blue-200/50 rounded w-1/3" />
            <div className="h-3 bg-blue-200/50 rounded w-1/4" />
            <div className="h-3 bg-blue-200/50 rounded w-1/5" />
          </div>
          <div className="flex flex-col items-center ml-4">
            <div className="size-14 rounded-full bg-blue-200/50" />
            <div className="h-3 bg-blue-200/50 rounded w-10 mt-1" />
          </div>
        </div>
        <div className="mt-3 p-3 bg-blue-200/20 rounded-md h-12" />
        <div className="mt-2 flex gap-1">
          {[1, 2, 3].map((s) => (
            <div key={s} className="h-5 bg-blue-200/50 rounded-full w-16" />
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <div className="h-4 bg-blue-200/50 rounded w-32" />
        </div>
      </div>
    ))}
  </div>
);
