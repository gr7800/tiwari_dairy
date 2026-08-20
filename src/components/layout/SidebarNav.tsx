"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ICONS } from "@/components/layout/navIcons";

interface NavItem {
  href: string;
  label: string;
}

/**
 * Active-state affordance is layered (background tint + icon/text color +
 * aria-current), not just one signal — an icon that also changes color reads
 * as unambiguous at a glance in a way a background change alone doesn't.
 * Styled for the sidebar's permanently-dark surface (see DashboardLayout),
 * not the app's light/dark mode toggle — the sidebar's richness is a fixed
 * brand signature, independent of reading mode.
 */
export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="flex-1 space-y-1 p-3">
      {items.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = NAV_ICONS[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition-colors duration-150 ${
              isActive ? "bg-white/15 font-semibold text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            {Icon && <Icon className="shrink-0" />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
