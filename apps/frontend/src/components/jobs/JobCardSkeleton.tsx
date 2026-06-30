export const JobCardSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="animate-pulse space-y-0.5 bg-card border border-border rounded-xl">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-start gap-3 px-4 py-3">
        <div className="w-[3px] self-stretch rounded-full bg-muted shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        <div className="h-3 bg-muted rounded w-16 shrink-0 mt-1" />
      </div>
    ))}
  </div>
);
