"use client";

import { usePathname } from "next/navigation";

/**
 * Keying on pathname forces a remount on navigation, which restarts the
 * fade-in-up CSS animation — a lightweight substitute for a real route
 * transition since the app has no animation library.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-in-up">
      {children}
    </div>
  );
}
