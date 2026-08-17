"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
}

/**
 * Active-state affordance is layered (background tint + left gold bar +
 * text color + aria-current), not just one background color — several small
 * signals together read as unambiguous at a glance in a way a single color
 * change doesn't. Styled for the sidebar's permanently-dark surface (see
 * DashboardLayout), not the app's light/dark mode toggle — the sidebar's
 * richness is a fixed brand signature, independent of reading mode.
 */
export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="flex-1 space-y-1 p-3">
      {items.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`relative block rounded-lg px-3.5 py-2.5 text-sm transition-colors ${
              isActive ? "bg-white/10 font-medium text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            {isActive && (
              <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gold" aria-hidden="true" />
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
