import Link from "next/link";

/**
 * A plain-links pager (no client JS) so it works the same way as every other
 * filter on these list pages — the current querystring's other params
 * (from/to/farmerId/search) are preserved and only `page` changes.
 */
export function Pagination({
  page,
  pageSize,
  totalCount,
  searchParams,
}: {
  page: number;
  pageSize: number;
  totalCount: number;
  searchParams: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalCount === 0 || totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key !== "page" && value) params.set(key, value);
    }
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
      <p>
        Showing <span className="font-medium text-slate-700 dark:text-slate-300">{start}–{end}</span> of{" "}
        <span className="font-medium text-slate-700 dark:text-slate-300">{totalCount}</span>
      </p>
      <div className="flex items-center gap-2">
        <PageLink href={hrefFor(page - 1)} disabled={page <= 1}>
          Previous
        </PageLink>
        <span className="tabular-nums">
          Page {page} of {totalPages}
        </span>
        <PageLink href={hrefFor(page + 1)} disabled={page >= totalPages}>
          Next
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({ href, disabled, children }: { href: string; disabled: boolean; children: React.ReactNode }) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-lg border border-slate-200 px-3 py-1.5 text-slate-300 dark:border-slate-700 dark:text-slate-600">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 transition-colors hover:border-accent hover:text-accent dark:border-slate-600 dark:text-slate-300 dark:hover:border-accent dark:hover:text-accent"
    >
      {children}
    </Link>
  );
}
