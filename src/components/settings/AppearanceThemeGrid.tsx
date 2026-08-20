"use client";

import { useEffect, useState } from "react";
import {
  ACCENT_THEMES,
  ACCENT_THEME_LABELS,
  ACCENT_THEME_SWATCH,
  ACCENT_THEME_STORAGE_KEY,
  THEME_MODE_STORAGE_KEY,
  applyTheme,
  isAccentTheme,
  type AccentTheme,
  type ThemeMode,
} from "@/lib/theme";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const ACCENT_DESCRIPTIONS: Record<AccentTheme, string> = {
  royal: "Rich purple — regal & elegant",
  emerald: "Fresh green — natural & confident",
  sapphire: "Calm blue — clean & professional",
  burgundy: "Deep red — bold & distinctive",
  slate: "Neutral grey — quiet & minimal",
};

function ThemeCard({
  title,
  description,
  isActive,
  onApply,
  preview,
}: {
  title: string;
  description: string;
  isActive: boolean;
  onApply: () => void;
  preview: React.ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-all active:scale-[0.97] dark:bg-slate-800 ${
        isActive
          ? "border-accent ring-2 ring-accent"
          : "border-slate-200 hover:shadow-md dark:border-slate-700"
      }`}
    >
      <div className="p-4">{preview}</div>
      <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-700">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-slate-900 dark:text-slate-100">{title}</p>
          {isActive && <Badge className="bg-accent-light text-accent">Current</Badge>}
        </div>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        <Button
          type="button"
          variant={isActive ? "secondary" : "primary"}
          disabled={isActive}
          onClick={onApply}
          className="mt-3 w-full"
        >
          {isActive ? "Applied" : "Apply"}
        </Button>
      </div>
    </div>
  );
}

function AccentPreview({ swatch }: { swatch: string }) {
  return (
    <div className="h-24 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-900">
      <div className="h-2" style={{ backgroundColor: swatch }} />
      <div className="space-y-1.5 p-3">
        <div className="h-1.5 w-3/4 rounded bg-slate-300 dark:bg-slate-600" />
        <div className="h-1.5 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-2 h-4 w-14 rounded-full" style={{ backgroundColor: swatch }} />
      </div>
    </div>
  );
}

function ModePreview({ mode }: { mode: ThemeMode }) {
  const isDark = mode === "dark";
  return (
    <div
      className={`h-24 w-full overflow-hidden rounded-lg border p-3 ${
        isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
      }`}
    >
      <div className="space-y-1.5">
        <div className={`h-1.5 w-3/4 rounded ${isDark ? "bg-slate-600" : "bg-slate-300"}`} />
        <div className={`h-1.5 w-1/2 rounded ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
      </div>
      <div className={`mt-3 h-8 w-8 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-100"}`} />
    </div>
  );
}

/**
 * Full-page theme browser for Settings — a richer, more deliberate surface
 * than the sidebar's quick-toggle ThemeToggle popover. Both read/write the
 * same localStorage keys and call the same applyTheme(), so a change made
 * here or in the sidebar always stays in sync.
 */
export function AppearanceThemeGrid() {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [accent, setAccentState] = useState<AccentTheme>("royal");

  useEffect(() => {
    const root = document.documentElement;
    setModeState(root.classList.contains("dark") ? "dark" : "light");
    const currentAccent = root.dataset.theme;
    if (isAccentTheme(currentAccent)) setAccentState(currentAccent);
  }, []);

  function applyMode(nextMode: ThemeMode) {
    setModeState(nextMode);
    localStorage.setItem(THEME_MODE_STORAGE_KEY, nextMode);
    applyTheme(nextMode, accent);
  }

  function applyAccent(nextAccent: AccentTheme) {
    setAccentState(nextAccent);
    localStorage.setItem(ACCENT_THEME_STORAGE_KEY, nextAccent);
    applyTheme(mode, nextAccent);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Mode</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Choose a light or dark reading mode for the whole app.</p>
        <div className="grid grid-cols-2 gap-4 sm:max-w-md">
          <ThemeCard
            title="Light"
            description="Clean, bright & professional"
            isActive={mode === "light"}
            onApply={() => applyMode("light")}
            preview={<ModePreview mode="light" />}
          />
          <ThemeCard
            title="Dark"
            description="Easy on the eyes, low glare"
            isActive={mode === "dark"}
            onApply={() => applyMode("dark")}
            preview={<ModePreview mode="dark" />}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Accent Color</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">The brand color used for the sidebar, buttons and highlights.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACCENT_THEMES.map((theme) => (
            <ThemeCard
              key={theme}
              title={ACCENT_THEME_LABELS[theme]}
              description={ACCENT_DESCRIPTIONS[theme]}
              isActive={accent === theme}
              onApply={() => applyAccent(theme)}
              preview={<AccentPreview swatch={ACCENT_THEME_SWATCH[theme]} />}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
