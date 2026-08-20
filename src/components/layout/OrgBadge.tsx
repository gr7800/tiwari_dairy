// Styled for the sidebar/drawer's permanently-dark surface (not the app's
// light/dark mode toggle) — a translucent circle reads cleanly against any
// accent-dark background, so it doesn't need to flip with reading mode.
export function OrgBadge({ name, className = "" }: { name: string; className?: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "T";
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 font-heading text-base font-bold text-white ring-1 ring-inset ring-gold ${className}`}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
