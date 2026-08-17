"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { OrgBadge } from "@/components/layout/OrgBadge";

interface NavItem {
  href: string;
  label: string;
}

const STORAGE_KEY = "dairy-sidebar-collapsed";

// A static panel icon (rounded rect + divider) rather than a direction arrow
// that flips — the reference layout uses one consistent glyph regardless of
// state, relying on aria-label/tooltip for the state change instead.
function PanelIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M9.5 4v16" />
    </svg>
  );
}

/**
 * Wraps the desktop sidebar + topbar + main content in a client component so
 * the collapse toggle (topbar) and the sidebar (aside) can share state — the
 * server layout just fetches org/user data and hands it down as props.
 * Collapsing fully hides the sidebar (width -> 0) rather than shrinking to an
 * icon rail, since nav items don't have an icon set of their own yet.
 */
export function DashboardShell({
  orgName,
  navItems,
  signOutAction,
  today,
  children,
}: {
  orgName: string;
  navItems: NavItem[];
  signOutAction: () => Promise<void>;
  today: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed, mounted]);

  return (
    <div className="flex min-h-screen">
      <aside
        aria-label="Main navigation"
        className={`hidden shrink-0 flex-col overflow-hidden bg-accent-dark transition-[width] duration-200 ease-in-out md:flex ${
          collapsed ? "w-0" : "w-64"
        }`}
      >
        <div className="flex h-16 w-64 shrink-0 items-center gap-3 border-b border-white/10 px-4">
          <OrgBadge name={orgName} />
          <p className="truncate font-heading text-base font-semibold text-white">{orgName}</p>
        </div>
        <div className="w-64 flex-1">
          <SidebarNav items={navItems} />
        </div>
        <div className="w-64 shrink-0 border-t border-white/10 p-3">
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm md:px-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-1.5">
            <MobileNav items={navItems} orgName={orgName} signOutAction={signOutAction} />
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
              aria-expanded={!collapsed}
              title={collapsed ? "Open sidebar" : "Close sidebar"}
              className="hidden rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:inline-flex dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <PanelIcon />
            </button>
            <span className="ml-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="hidden sm:inline">Today: </span>
              {today}
            </span>
          </div>
          <form action={signOutAction} className="hidden md:block">
            <Button type="submit" variant="ghost">
              Sign out
            </Button>
          </form>
        </header>
        <main className="min-w-0 flex-1 bg-slate-50 p-3 sm:p-4 md:p-6 dark:bg-slate-900">{children}</main>
      </div>
    </div>
  );
}
