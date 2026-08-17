"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACCENT_THEMES,
  ACCENT_THEME_LABELS,
  ACCENT_THEME_STORAGE_KEY,
  ACCENT_THEME_SWATCH,
  THEME_MODE_STORAGE_KEY,
  applyTheme,
  isAccentTheme,
  type AccentTheme,
  type ThemeMode,
} from "@/lib/theme";

export function ThemeToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ThemeMode>("light");
  const [accent, setAccent] = useState<AccentTheme>("royal");
  const containerRef = useRef<HTMLDivElement>(null);

  // Read what the bootstrap script already applied to <html> — avoids a
  // hydration mismatch since the server has no idea what the client's
  // localStorage preference is.
  useEffect(() => {
    const root = document.documentElement;
    setMode(root.classList.contains("dark") ? "dark" : "light");
    const currentAccent = root.dataset.theme;
    if (isAccentTheme(currentAccent)) setAccent(currentAccent);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function updateMode(nextMode: ThemeMode) {
    setMode(nextMode);
    localStorage.setItem(THEME_MODE_STORAGE_KEY, nextMode);
    applyTheme(nextMode, accent);
  }

  function updateAccent(nextAccent: AccentTheme) {
    setAccent(nextAccent);
    localStorage.setItem(ACCENT_THEME_STORAGE_KEY, nextAccent);
    applyTheme(mode, nextAccent);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Theme settings"
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
      >
        <span aria-hidden="true">{mode === "dark" ? "🌙" : "☀️"}</span>
        Theme
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">Mode</p>
          <div className="mb-3 flex gap-2">
            {(["light", "dark"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => updateMode(m)}
                className={`flex-1 rounded-md border px-2 py-1.5 text-sm capitalize ${
                  mode === m
                    ? "border-accent bg-accent-light text-accent"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">Accent</p>
          <div className="flex gap-2">
            {ACCENT_THEMES.map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => updateAccent(theme)}
                aria-label={ACCENT_THEME_LABELS[theme]}
                aria-pressed={accent === theme}
                title={ACCENT_THEME_LABELS[theme]}
                className={`h-7 w-7 rounded-full ring-offset-2 dark:ring-offset-slate-800 ${
                  accent === theme ? "ring-2 ring-slate-400" : ""
                }`}
                style={{ backgroundColor: ACCENT_THEME_SWATCH[theme] }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
