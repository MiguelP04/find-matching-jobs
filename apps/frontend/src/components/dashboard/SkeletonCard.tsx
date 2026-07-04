export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border bg-card p-5">
      <div className="mb-3 h-4 w-1/3 rounded bg-muted" />
      <div className="mb-2 h-3 w-full rounded bg-muted" />
      <div className="mb-2 h-3 w-3/4 rounded bg-muted" />
      <div className="h-3 w-1/2 rounded bg-muted" />
    </div>
  );
}