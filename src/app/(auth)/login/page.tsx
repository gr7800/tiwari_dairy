import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* Compact brand band shown only on narrow viewports */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-accent-dark to-accent px-6 py-5 md:hidden">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-light font-heading text-base font-bold text-accent ring-1 ring-gold/40">
          T
        </span>
        <span className="font-heading text-lg font-semibold text-white">Tiwari Dairy</span>
      </div>

      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-accent-dark via-accent to-accent-dark md:flex md:w-1/2 md:flex-col md:items-center md:justify-center md:p-12 lg:w-5/12">
        <svg
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 text-white/10"
          viewBox="0 0 400 400"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="200" cy="200" r="200" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <svg
          className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 text-white/10"
          viewBox="0 0 400 400"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="200" cy="200" r="200" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <svg
          className="pointer-events-none absolute left-1/2 top-[15%] h-56 w-56 -translate-x-1/2 text-white/5"
          viewBox="0 0 400 400"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="200" cy="200" r="200" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="relative z-10 flex max-w-xs flex-col items-center text-center">
          <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-light font-heading text-3xl font-bold text-accent ring-1 ring-gold/40">
            T
          </span>
          <p className="font-heading text-3xl font-semibold text-white">Tiwari Dairy</p>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            Track every farmer&apos;s milk, payments, and dues — all in one ledger.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-white p-6 dark:bg-slate-900 sm:p-10">
        <LoginForm />
      </div>
    </main>
  );
}
