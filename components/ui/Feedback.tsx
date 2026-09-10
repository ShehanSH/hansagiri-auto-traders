export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border border-dashed border-gold/20 bg-dark-secondary/60 px-6 py-16 text-center">
      <p className="font-display text-xl text-white">{title}</p>
      {description ? <p className="mt-3 text-sm text-muted">{description}</p> : null}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-white/5 ${className}`} />;
}

export function VehicleCardSkeleton() {
  return (
    <div className="surface-card overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        className="border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.16em] disabled:opacity-30"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Previous
      </button>
      <span className="px-3 text-xs text-muted">
        {page} / {pages}
      </span>
      <button
        type="button"
        className="border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.16em] disabled:opacity-30"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
