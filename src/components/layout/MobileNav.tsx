"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { OrgBadge } from "@/components/layout/OrgBadge";
import { NAV_ICONS } from "@/components/layout/navIcons";

interface NavItem {
  href: string;
  label: string;
}

/**
 * Mobile gets its own nav component rather than squeezing the desktop
 * sidebar into a responsive shape — a slide-out drawer behind a hamburger
 * toggle is a different interaction model (overlay + backdrop dismiss) than
 * a persistent sidebar, not just a narrower version of one. Styled to match
 * the desktop sidebar's rich accent-dark treatment so it reads as the same
 * navigation, just presented as an overlay.
 */
export function MobileNav({
  items,
  orgName,
  signOutAction,
}: {
  items: NavItem[];
  orgName: string;
  signOutAction: () => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close on navigation so the drawer doesn't stay open after tapping a link.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent background scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-30 flex">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/50 animate-fade-in"
          />
          <aside
            aria-label="Main navigation"
            className="relative flex h-full w-72 max-w-[85vw] flex-col bg-accent-dark shadow-2xl animate-slide-in-left"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <OrgBadge name={orgName} />
                <p className="truncate font-heading text-base font-semibold text-white">{orgName}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="shrink-0 rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {items.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = NAV_ICONS[item.href];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3.5 py-3 text-base transition-colors duration-150 ${
                      isActive ? "bg-white/15 font-semibold text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {Icon && <Icon className="shrink-0" />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center justify-between border-t border-white/10 p-3">
              <ThemeToggle />
              <form action={signOutAction}>
                <button type="submit" className="rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
                  Sign out
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
