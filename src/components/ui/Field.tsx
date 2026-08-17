import { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, forwardRef } from "react";

// py-2.5 (not py-2) keeps every input/select at a ~44px touch target on
// mobile, and the richer focus ring (ring-2 + ring-offset) reads as more
// deliberate/elegant than a flat 1px outline.
const baseInputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-shadow focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-accent/40 dark:disabled:bg-slate-700 dark:disabled:text-slate-400";

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" {...props} />;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={`${baseInputClasses} ${className}`} {...props} />
  )
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={`${baseInputClasses} appearance-none pr-9 ${className}`}
        {...props}
      />
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
      </svg>
    </div>
  )
);
Select.displayName = "Select";

export function FieldGroup({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint}
      </div>
      {children}
      {error && <p className="mt-1 text-sm text-unpaid">{error}</p>}
    </div>
  );
}
