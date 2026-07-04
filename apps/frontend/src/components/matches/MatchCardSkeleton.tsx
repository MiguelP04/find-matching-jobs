export const MatchCardSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="relative flex gap-4 p-5 rounded-xl border border-border bg-card shadow-sm">
        <div className="w-[4px] shrink-0 rounded-full bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
            <div className="h-7 w-16 bg-muted rounded-full" />
          </div>
          <div className="flex gap-3">
            <div className="h-3 bg-muted rounded w-1/4" />
            <div className="h-3 bg-muted rounded w-1/4" />
          </div>
          <div className="p-3 bg-muted rounded-lg h-12" />
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <div key={s} className="h-5 bg-muted rounded-full w-16" />
            ))}
          </div>
          <div className="flex gap-2">
            <div className="h-3 bg-muted rounded w-16" />
            <div className="h-3 bg-muted rounded w-12" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
